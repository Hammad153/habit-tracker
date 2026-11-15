import type { IHabit, ICompletion } from './model';

export type HabitBurial = {
  id: string;
  habitId: string;
  userId: string;
  title: string;
  habitCreatedAt: string;
  buriedAt: string;
  lastCompletedDay?: string | null;
  totalCompletions: number;
  bestStreak: number;
  reason?: string | null;
  epitaph: string;
  theme: string;
  restoredAt?: string | null;
  restartHabitId?: string | null;
};

export type HabitCommand =
  | { id: string; type: 'create'; habit: IHabit }
  | { id: string; type: 'update'; habitId: string; patch: Partial<IHabit>; expectedVersion?: number }
  | { id: string; type: 'completion'; habitId: string; date: string; status: boolean; value: number; kind: ICompletion['kind'] }
  | { id: string; type: 'bury'; habitId: string; burial: HabitBurial }
  | { id: string; type: 'restore'; habitId: string; burialId: string }
  | { id: string; type: 'restart'; habit: IHabit; burialId: string }
  | { id: string; type: 'transition'; habitId: string; status: NonNullable<IHabit['lifecycleStatus']> };

export type HabitEvent =
  | { type: 'habit'; habit: IHabit }
  | { type: 'burial'; burial: HabitBurial }
  | { type: 'command'; command: HabitCommand }
  | { type: 'ack'; commandId: string; habit?: IHabit; burial?: HabitBurial; rewards?: { coinsAwarded: number; newStreakMilestones?: number[] } }
  | { type: 'failure'; commandId: string; message: string };

export const projectHabitEvents = (events: HabitEvent[]) => {
  const habits = new Map<string, IHabit>();
  const burials = new Map<string, HabitBurial>();
  const commands: HabitCommand[] = [];
  const acknowledged = new Set<string>();
  const failures: Record<string, string> = {};
  const rewards: Record<string, { coinsAwarded: number; newStreakMilestones?: number[] }> = {};

  for (const event of events) {
    if (event.type === 'habit') habits.set(event.habit.id, event.habit);
    if (event.type === 'burial') burials.set(event.burial.id, event.burial);
    if (event.type === 'command') commands.push(event.command);
    if (event.type === 'ack') {
      acknowledged.add(event.commandId);
      delete failures[event.commandId];
      if (event.habit) habits.set(event.habit.id, event.habit);
      if (event.burial) burials.set(event.burial.id, event.burial);
      if (event.rewards) rewards[event.commandId] = event.rewards;
    }
    if (event.type === 'failure') failures[event.commandId] = event.message;
  }

  const pending = commands.filter((command) => !acknowledged.has(command.id));
  for (const command of pending) {
    if (command.type === 'create') {
      habits.set(command.habit.id, command.habit);
      continue;
    }
    if (command.type === 'restart') {
      const burial = burials.get(command.burialId);
      if (burial) burials.set(burial.id, { ...burial, restartHabitId: command.habit.id });
      continue;
    }
    if (command.type === 'bury') {
      burials.set(command.burial.id, command.burial);
      const existing = habits.get(command.habitId);
      if (existing) habits.set(existing.id, { ...existing, lifecycleStatus: 'BURIED', isArchived: true });
      continue;
    }
    if (command.type === 'restore') {
      const burial = burials.get(command.burialId);
      const habitId = burial?.habitId ?? command.habitId;
      const existing = habits.get(habitId);
      if (existing) habits.set(existing.id, { ...existing, lifecycleStatus: 'ACTIVE', isArchived: false });
      if (burial) burials.set(burial.id, { ...burial, restoredAt: new Date(0).toISOString() });
      continue;
    }
    const habit = habits.get(command.habitId);
    if (!habit) continue;
    if (command.type === 'update') habits.set(habit.id, { ...habit, ...command.patch });
    if (command.type === 'transition') habits.set(habit.id, {
      ...habit, lifecycleStatus: command.status,
      isArchived: ['ARCHIVED', 'COMPLETED', 'BURIED', 'EXPIRED'].includes(command.status),
    });
    if (command.type === 'completion') {
      const other = (habit.completions ?? []).filter((entry) => entry.date !== command.date);
      const completions = command.status
        ? [...other, { id: `local-${command.id}`, habitId: habit.id, date: command.date, status: true, value: command.value, kind: command.kind }]
        : other;
      habits.set(habit.id, { ...habit, completions });
    }
  }
  return { habits: [...habits.values()], burials: [...burials.values()], pending, failures, rewards };
};
