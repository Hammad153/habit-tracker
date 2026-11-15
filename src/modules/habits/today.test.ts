import { getTodaySections } from './today';

describe('getTodaySections', () => {
  const date = new Date(2026, 6, 11);
  const base = { userId: 'u1', goal: 1, completions: [], isArchived: false, createdAt: '2026-07-01T00:00:00Z' };

  it('does not count unscheduled or paused habits as due', () => {
    const sections = getTodaySections([
      { ...base, id: 'daily', scheduleType: 'daily' },
      { ...base, id: 'friday', scheduleType: 'specific_days', scheduleDays: ['Fri'] },
      { ...base, id: 'paused', scheduleType: 'daily', lifecycleStatus: 'PAUSED' },
    ] as any, date);
    expect(sections.due.map((h) => h.id)).toEqual(['daily']);
    expect(sections.notScheduled.map((h) => h.id)).toEqual(['friday']);
    expect(sections.paused.map((h) => h.id)).toEqual(['paused']);
  });

  it('separates completed from due', () => {
    const sections = getTodaySections([{ ...base, id: 'done', completions: [{ date: '2026-07-11', status: true }] }] as any, date);
    expect(sections.completed).toHaveLength(1);
    expect(sections.due).toHaveLength(0);
  });
});
