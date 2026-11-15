import { projectHabitEvents } from './local-state';

describe('local habit projection', () => {
  const habit = { id: 'h1', title: 'Read', goal: 1, isArchived: false, completions: [] } as any;

  it('keeps an offline create and completion visible until acknowledgement', () => {
    const events = [
      { type: 'command', command: { id: 'c1', type: 'create', habit } },
      { type: 'command', command: { id: 'c2', type: 'completion', habitId: 'h1', date: '2026-11-14', status: true, value: 1, kind: 'FULL' } },
    ] as any;
    const state = projectHabitEvents(events);
    expect(state.habits[0].completions?.[0].status).toBe(true);
    expect(state.pending.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('replaces acknowledged local state with server state and keeps later pending edits', () => {
    const events = [
      { type: 'command', command: { id: 'c1', type: 'create', habit } },
      { type: 'ack', commandId: 'c1', habit: { ...habit, version: 0 } },
      { type: 'command', command: { id: 'c2', type: 'update', habitId: 'h1', patch: { title: 'Read more' } } },
    ] as any;
    const state = projectHabitEvents(events);
    expect(state.habits[0].title).toBe('Read more');
    expect(state.pending).toHaveLength(1);
  });

  it('retains failed operations for recovery', () => {
    const state = projectHabitEvents([
      { type: 'command', command: { id: 'c1', type: 'create', habit } },
      { type: 'failure', commandId: 'c1', message: 'Validation failed' },
    ] as any);
    expect(state.pending).toHaveLength(1);
    expect(state.failures.c1).toBe('Validation failed');
  });
});
