import { projectHabitEvents } from './local-state';
import type { HabitEvent, HabitBurial } from './local-state';

const habit = { id: 'h1', title: 'Read', goal: 1, isArchived: false, completions: [], lifecycleStatus: 'ACTIVE', version: 0 } as any;

const burial: HabitBurial = {
  id: 'b1',
  habitId: 'h1',
  userId: 'u1',
  title: 'Read',
  habitCreatedAt: '2026-11-01T00:00:00.000Z',
  buriedAt: '2026-11-03T00:00:00.000Z',
  lastCompletedDay: null,
  totalCompletions: 2,
  bestStreak: 2,
  reason: 'Lost interest',
  epitaph: 'A promising beginning. A memorable ending.',
  theme: 'stone',
};

describe('offline acceptance - burial and restoration', () => {
  it('keeps an offline burial visible until server acknowledgement', () => {
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c0', type: 'create', habit } },
      { type: 'command', command: { id: 'c1', type: 'bury', habitId: 'h1', burial } },
    ];
    const state = projectHabitEvents(events);

    expect(state.habits[0].lifecycleStatus).toBe('BURIED');
    expect(state.habits[0].isArchived).toBe(true);
    expect(state.burials[0].id).toBe('b1');
    expect(state.burials[0].title).toBe('Read');
    expect(state.pending).toHaveLength(2);
  });

  it('applies server acknowledgement replacing local burial state', () => {
    const updatedBurial = { ...burial, epitaph: 'Updated epitaph.' };
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c0', type: 'create', habit } },
      { type: 'command', command: { id: 'c1', type: 'bury', habitId: 'h1', burial } },
      { type: 'ack', commandId: 'c0', habit },
      { type: 'ack', commandId: 'c1', habit: { ...habit, lifecycleStatus: 'BURIED', version: 1 }, burial: updatedBurial },
    ];
    const state = projectHabitEvents(events);

    expect(state.habits[0].lifecycleStatus).toBe('BURIED');
    expect(state.burials[0].epitaph).toBe('Updated epitaph.');
    expect(state.pending).toHaveLength(0);
  });

  it('applies offline restoration preserving history', () => {
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c0', type: 'create', habit } },
      { type: 'command', command: { id: 'c1', type: 'bury', habitId: 'h1', burial } },
      { type: 'command', command: { id: 'c2', type: 'restore', habitId: '', burialId: 'b1' } },
    ];
    const state = projectHabitEvents(events);

    expect(state.habits[0].lifecycleStatus).toBe('ACTIVE');
    expect(state.habits[0].isArchived).toBe(false);
    expect(state.burials[0].restoredAt).toBeDefined();
    expect(state.pending).toHaveLength(3);
  });

  it('keeps completion as explicit desired state after offline toggle', () => {
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c1', type: 'create', habit } },
      { type: 'command', command: { id: 'c2', type: 'completion', habitId: 'h1', date: '2026-11-14', status: true, value: 1, kind: 'FULL' } },
      { type: 'command', command: { id: 'c3', type: 'completion', habitId: 'h1', date: '2026-11-14', status: false, value: 0, kind: 'FULL' } },
    ];
    const state = projectHabitEvents(events);

    // Last command wins - explicit desired state, not ambiguous toggle
    expect(state.habits[0].completions).toHaveLength(0);
    expect(state.pending).toHaveLength(3);
  });

  it('handles restart command without incomplete local habit data', () => {
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c0', type: 'create', habit } },
      { type: 'command', command: { id: 'c1', type: 'bury', habitId: 'h1', burial } },
      { type: 'command', command: { id: 'c2', type: 'restart', habit: { id: 'h2' } as any, burialId: 'b1' } },
    ];
    const state = projectHabitEvents(events);

    // Restart should not add incomplete habit data locally
    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].id).toBe('h1');
    expect(state.habits[0].lifecycleStatus).toBe('BURIED');
    // Burial should be linked to the restart habit
    expect(state.burials[0].restartHabitId).toBe('h2');
    expect(state.pending).toHaveLength(3);
  });

  it('retains server habit after ack replaces local placeholder for restart', () => {
    const newHabit = { id: 'h2', title: 'Read (Restart)', goal: 1, isArchived: false, completions: [], lifecycleStatus: 'ACTIVE', version: 0 } as any;
    const events: HabitEvent[] = [
      { type: 'command', command: { id: 'c0', type: 'create', habit } },
      { type: 'command', command: { id: 'c1', type: 'bury', habitId: 'h1', burial } },
      { type: 'command', command: { id: 'c2', type: 'restart', habit: { id: 'h2' } as any, burialId: 'b1' } },
      { type: 'ack', commandId: 'c0', habit },
      { type: 'ack', commandId: 'c1', habit: { ...habit, lifecycleStatus: 'BURIED', version: 1 }, burial },
      { type: 'ack', commandId: 'c2', habit: newHabit },
    ];
    const state = projectHabitEvents(events);

    expect(state.habits).toHaveLength(2);
    const restarted = state.habits.find((h) => h.id === 'h2');
    expect(restarted).toBeDefined();
    if (!restarted) throw new Error('Restarted habit not found');
    expect(restarted.title).toBe('Read (Restart)');
    expect(state.pending).toHaveLength(0);
  });
});

describe('offline acceptance - account isolation via projection', () => {
  it('keeps habits separate when events from different users are projected independently', () => {
    const eventsUserA: HabitEvent[] = [
      { type: 'command', command: { id: 'c1', type: 'create', habit: { ...habit, id: 'hA' } } },
    ];
    const eventsUserB: HabitEvent[] = [
      { type: 'command', command: { id: 'c2', type: 'create', habit: { ...habit, id: 'hB' } } },
    ];

    const stateA = projectHabitEvents(eventsUserA);
    const stateB = projectHabitEvents(eventsUserB);

    expect(stateA.habits[0].id).toBe('hA');
    expect(stateB.habits[0].id).toBe('hB');
    expect(stateA.habits[0].id).not.toBe(stateB.habits[0].id);
  });

  it('does not mix burials across users in independent projections', () => {
    const burialA = { ...burial, id: 'bA', userId: 'u1' };
    const burialB = { ...burial, id: 'bB', userId: 'u2' };
    const habitA = { ...habit, id: 'hA' };
    const habitB = { ...habit, id: 'hB' };

    const eventsA: HabitEvent[] = [
      { type: 'command', command: { id: 'c1', type: 'create', habit: habitA } },
      { type: 'command', command: { id: 'c2', type: 'bury', habitId: 'hA', burial: burialA } },
    ];
    const eventsB: HabitEvent[] = [
      { type: 'command', command: { id: 'c3', type: 'create', habit: habitB } },
      { type: 'command', command: { id: 'c4', type: 'bury', habitId: 'hB', burial: burialB } },
    ];

    const stateA = projectHabitEvents(eventsA);
    const stateB = projectHabitEvents(eventsB);

    expect(stateA.burials[0].id).toBe('bA');
    expect(stateB.burials[0].id).toBe('bB');
    expect(stateA.burials[0].userId).toBe('u1');
    expect(stateB.burials[0].userId).toBe('u2');
    expect(stateA.habits[0].id).toBe('hA');
    expect(stateB.habits[0].id).toBe('hB');
  });
});
