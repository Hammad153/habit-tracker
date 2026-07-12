import { getCurrentStreak, isHabitScheduledForDate } from "./schedule";
import { toDateKey } from "./date";

const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
};

describe("getCurrentStreak", () => {
  it("returns 0 with no completions", () => {
    expect(getCurrentStreak()).toBe(0);
    expect(getCurrentStreak([])).toBe(0);
  });

  it("counts a streak ending today", () => {
    const completions = [
      { date: dayKey(0), status: true },
      { date: dayKey(-1), status: true },
      { date: dayKey(-2), status: true },
    ];
    expect(getCurrentStreak(completions)).toBe(3);
  });

  it("keeps the streak when today is not yet done", () => {
    const completions = [
      { date: dayKey(-1), status: true },
      { date: dayKey(-2), status: true },
    ];
    expect(getCurrentStreak(completions)).toBe(2);
  });

  it("breaks the streak on a gap", () => {
    const completions = [
      { date: dayKey(0), status: true },
      { date: dayKey(-2), status: true },
      { date: dayKey(-3), status: true },
    ];
    expect(getCurrentStreak(completions)).toBe(1);
  });

  it("ignores incomplete (status false) entries", () => {
    const completions = [
      { date: dayKey(0), status: false },
      { date: dayKey(-1), status: false },
    ];
    expect(getCurrentStreak(completions)).toBe(0);
  });

  it("skips non-scheduled dates for a habit streak", () => {
    const friday = new Date();
    while (friday.getDay() !== 5) friday.setDate(friday.getDate() - 1);
    const previousFriday = new Date(friday);
    previousFriday.setDate(friday.getDate() - 7);

    const habit = {
      scheduleType: "specific_days",
      scheduleDays: ["Fri"],
    } as any;

    expect(
      getCurrentStreak(
        [
          { date: toDateKey(friday), status: true },
          { date: toDateKey(previousFriday), status: true },
        ],
        habit,
      ),
    ).toBe(2);
  });
});

describe("isHabitScheduledForDate", () => {
  it("only schedules specific-day habits on their selected days", () => {
    const friday = new Date(2026, 6, 10);
    const saturday = new Date(2026, 6, 11);
    const habit = {
      scheduleType: "specific_days",
      scheduleDays: ["Fri"],
    } as any;

    expect(isHabitScheduledForDate(habit, friday)).toBe(true);
    expect(isHabitScheduledForDate(habit, saturday)).toBe(false);
  });

  it("spreads times-per-week habits from the creation weekday", () => {
    const habit = {
      scheduleType: "times_per_week",
      timesPerWeek: 3,
      createdAt: "2026-07-10T09:00:00.000Z",
    } as any;

    expect(isHabitScheduledForDate(habit, new Date(2026, 6, 10))).toBe(true);
    expect(isHabitScheduledForDate(habit, new Date(2026, 6, 11))).toBe(false);
    expect(isHabitScheduledForDate(habit, new Date(2026, 6, 12))).toBe(true);
  });
});
