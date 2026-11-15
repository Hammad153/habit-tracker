import { HabitService } from './api';
import { appendHabitEvent, readHabitEvents } from './local-store';
import { HabitBurial, HabitCommand, HabitEvent, projectHabitEvents } from './local-state';
import type { IHabit } from './model';

const activeSyncs = new Map<string, Promise<ReturnType<typeof projectHabitEvents>>>();
const commandTails = new Map<string, Promise<unknown>>();

export const newLocalId = (): string => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 3) | 8).toString(16);
  });
};

export const loadHabitState = async (userId: string) =>
  projectHabitEvents(await readHabitEvents(userId));

export const saveHabitCommand = async (userId: string, command: HabitCommand) => {
  await appendHabitEvent(userId, { type: 'command', command });
  return loadHabitState(userId);
};

export const saveComputedHabitCommand = (userId: string, build: (state: Awaited<ReturnType<typeof loadHabitState>>) => HabitCommand) => {
  const previous = commandTails.get(userId) ?? Promise.resolve();
  const work = previous.catch(() => undefined).then(async () => {
    const state = await loadHabitState(userId);
    const command = build(state);
    await appendHabitEvent(userId, { type: 'command', command });
    return loadHabitState(userId);
  });
  commandTails.set(userId, work);
  const clear = () => { if (commandTails.get(userId) === work) commandTails.delete(userId); };
  void work.then(clear, clear);
  return work;
};

const executeCommand = async (userId: string, command: HabitCommand): Promise<Extract<HabitEvent, { type: 'ack' }>> => {
  let habit: IHabit | undefined;
  let burial: HabitBurial | undefined;
  let rewards: { coinsAwarded: number; newStreakMilestones?: number[] } | undefined;
  switch (command.type) {
    case 'create':
      habit = await HabitService.create(command.habit, userId);
      break;
    case 'update':
      habit = await HabitService.update(command.habitId, { ...command.patch, expectedVersion: command.expectedVersion });
      break;
    case 'completion':
      rewards = (await HabitService.setCompletion(command.habitId, command.date, command.status, command.value, command.kind))?.rewards;
      habit = await HabitService.getById(command.habitId);
      break;
    case 'bury':
      burial = await HabitService.bury(command.habitId, command.id, command.burial);
      habit = await HabitService.getById(command.habitId);
      break;
    case 'restore':
      habit = await HabitService.restoreBurial(command.burialId);
      burial = await HabitService.getBurial(command.burialId);
      break;
    case 'restart':
      habit = await HabitService.restartBurial(command.burialId, command.habit.id);
      burial = await HabitService.getBurial(command.burialId);
      break;
    case 'transition':
      habit = await HabitService.transition(command.habitId, command.status);
      break;
  }
  return { type: 'ack', commandId: command.id, habit, burial, rewards };
};

export const syncHabitCommands = (userId: string, onChange?: (state: Awaited<ReturnType<typeof loadHabitState>>) => void) => {
  const running = activeSyncs.get(userId);
  if (running) return running;
  const sync = (async () => {
    let state = await loadHabitState(userId);
    for (const command of state.pending) {
      if (state.failures[command.id]) break;
      try {
        const ack = await executeCommand(userId, command);
        await appendHabitEvent(userId, ack);
        state = await loadHabitState(userId);
        onChange?.(state);
      } catch (error: any) {
        const status = error?.response?.status;
        // Network, auth, rate-limit and server errors remain pending for retry.
        if (!status || status === 401 || status === 429 || status >= 500) break;
        const message = status === 409 ? 'Changed on another device. Review this habit before retrying.'
          : `Could not sync this change (HTTP ${status}). Review and retry.`;
        await appendHabitEvent(userId, { type: 'failure', commandId: command.id, message });
        state = await loadHabitState(userId);
        onChange?.(state);
        break;
      }
    }
    return state;
  })().finally(() => activeSyncs.delete(userId));
  activeSyncs.set(userId, sync);
  return sync;
};

export const refreshHabitSnapshots = async (userId: string) => {
  const habits = await HabitService.getAll(userId) as IHabit[];
  const previous = await readHabitEvents(userId);
  const lastHabits = new Map<string, IHabit>();
  for (const event of previous) {
    if (event.type === 'habit') lastHabits.set(event.habit.id, event.habit);
    if (event.type === 'ack' && event.habit) lastHabits.set(event.habit.id, event.habit);
  }
  for (const habit of habits) {
    if (JSON.stringify(lastHabits.get(habit.id)) !== JSON.stringify(habit)) {
      await appendHabitEvent(userId, { type: 'habit', habit });
    }
  }
  const lastBurials = new Map<string, HabitBurial>();
  for (const event of previous) {
    if (event.type === 'burial') lastBurials.set(event.burial.id, event.burial);
    if (event.type === 'ack' && event.burial) lastBurials.set(event.burial.id, event.burial);
  }
  let cursor: string | undefined;
  do {
    const page = await HabitService.getBurials(cursor);
    for (const burial of page) {
      if (JSON.stringify(lastBurials.get(burial.id)) !== JSON.stringify(burial)) {
        await appendHabitEvent(userId, { type: 'burial', burial });
      }
    }
    cursor = page.length === 30 ? page[page.length - 1].id : undefined;
  } while (cursor);
  return loadHabitState(userId);
};
