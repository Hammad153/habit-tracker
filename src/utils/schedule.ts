import { IHabit } from "@/src/modules/habits/model";
import { normalizeDateKey, toDateKey } from "@/src/utils/date";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const isHabitScheduledForDate = (habit: IHabit, date: Date): boolean => {
  const dateStr = toDateKey(date);

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

export const getCurrentStreak = (
  completions?: { date: string; status: boolean }[],
): number => {
  if (!completions || completions.length === 0) return 0;

  const doneDates = new Set(
    completions.filter((c) => c.status).map((c) => normalizeDateKey(c.date)),
  );
  if (doneDates.size === 0) return 0;

  const cursor = new Date();

  // If today isn't completed yet, start counting from yesterday so an active
  // streak isn't shown as broken before the day is over.
  if (!doneDates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (doneDates.has(toDateKey(cursor))) {
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
