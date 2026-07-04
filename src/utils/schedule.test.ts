import { getCurrentStreak } from "./schedule";

const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
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
});
