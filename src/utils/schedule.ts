import { IHabit } from "@/src/modules/habits/model";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Determines if a habit is scheduled for a given date.
 * Accounts for schedule type, specific days, times per week, interval, and rest days.
 */
export const isHabitScheduledForDate = (
  habit: IHabit,
  date: Date,
): boolean => {
  const dateStr = date.toISOString().split("T")[0];

  // Check if it's a rest day
  if (habit.restDays?.includes(dateStr)) {
    return false;
  }

  const scheduleType = habit.scheduleType || "daily";

  switch (scheduleType) {
    case "daily":
      return true;

    case "specific_days": {
      const dayName = DAY_NAMES[date.getDay()];
      return habit.scheduleDays?.includes(dayName) ?? true;
    }

    case "times_per_week":
      // For times_per_week, show the habit every day — the user chooses which days
      // But we could dim it once they've hit their weekly target
      return true;

    case "interval": {
      if (!habit.intervalDays || !habit.createdAt) return true;
      const createdDate = new Date(habit.createdAt);
      const diffTime = date.getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % habit.intervalDays === 0;
    }

    default:
      return true;
  }
};

/**
 * Computes the current consecutive-day streak from a habit's completions.
 * A streak counts back from today (or yesterday, so a not-yet-done-today habit
 * keeps its streak) while each preceding day has a completed entry.
 */
export const getCurrentStreak = (
  completions?: { date: string; status: boolean }[],
): number => {
  if (!completions || completions.length === 0) return 0;

  const doneDates = new Set(
    completions.filter((c) => c.status).map((c) => c.date),
  );
  if (doneDates.size === 0) return 0;

  const toKey = (d: Date) => d.toISOString().split("T")[0];
  const cursor = new Date();

  // If today isn't completed yet, start counting from yesterday so an active
  // streak isn't shown as broken before the day is over.
  if (!doneDates.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (doneDates.has(toKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

/**
 * Returns a user-friendly schedule description
 */
export const getScheduleLabel = (habit: IHabit): string => {
  const scheduleType = habit.scheduleType || "daily";

  switch (scheduleType) {
    case "daily":
      return "Every day";
    case "specific_days":
      return habit.scheduleDays?.join(", ") || "No days set";
    case "times_per_week":
      return `${habit.timesPerWeek || 0}x per week`;
    case "interval":
      return `Every ${habit.intervalDays || 0} days`;
    default:
      return "Daily";
  }
};
