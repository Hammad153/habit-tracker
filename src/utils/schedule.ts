import { IHabit } from "@/src/modules/habits/model";
import { normalizeDateKey, parseDateKey, toDateKey } from "@/src/utils/date";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getHabitStartDate = (habit: IHabit) =>
  habit.createdAt ? startOfLocalDay(new Date(habit.createdAt)) : startOfLocalDay(new Date());

const getTimesPerWeekDays = (habit: IHabit) => {
  const times = Math.min(Math.max(habit.timesPerWeek || 1, 1), 7);
  const startDay = getHabitStartDate(habit).getDay();

  return Array.from({ length: times }, (_, index) =>
    DAY_NAMES[(startDay + Math.floor((index * 7) / times)) % 7],
  );
};

const startOfWeek = (date: Date) => {
  const start = startOfLocalDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const isTimesPerWeekComplete = (
  habit: IHabit,
  weekStart: Date,
  completions?: { date: string; status: boolean }[],
) => {
  const target = Math.min(Math.max(habit.timesPerWeek || 1, 1), 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const done = new Set(
    (completions ?? [])
      .filter((completion) => {
        if (!completion.status) return false;
        const date = parseDateKey(completion.date);
        return date >= weekStart && date <= weekEnd;
      })
      .map((completion) => normalizeDateKey(completion.date)),
  );

  return done.size >= target;
};

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
      return habit.scheduleDays?.length ? habit.scheduleDays.includes(dayName) : true;
    }

    case "times_per_week": {
      const dayName = DAY_NAMES[date.getDay()];
      return getTimesPerWeekDays(habit).includes(dayName);
    }

    case "interval": {
      if (!habit.intervalDays || !habit.createdAt) return true;
      const createdDate = getHabitStartDate(habit);
      const diffTime = startOfLocalDay(date).getTime() - createdDate.getTime();
      const diffDays = Math.floor(diffTime / MS_PER_DAY);
      return diffDays >= 0 && diffDays % habit.intervalDays === 0;
    }

    default:
      return true;
  }
};

export const getCurrentStreak = (
  completions?: { date: string; status: boolean }[],
  habit?: IHabit,
): number => {
  if (!completions || completions.length === 0) return 0;

  const doneDates = new Set(
    completions.filter((c) => c.status).map((c) => normalizeDateKey(c.date)),
  );
  if (doneDates.size === 0) return 0;

  if (habit?.scheduleType === "times_per_week") {
    const cursor = startOfWeek(new Date());

    if (!isTimesPerWeekComplete(habit, cursor, completions)) {
      cursor.setDate(cursor.getDate() - 7);
    }

    let streak = 0;
    while (isTimesPerWeekComplete(habit, cursor, completions)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }

    return streak;
  }

  const cursor = new Date();

  // If today isn't completed yet, start counting from yesterday so an active
  // streak isn't shown as broken before the day is over.
  if (!doneDates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (
    doneDates.has(toDateKey(cursor)) ||
    (habit && !isHabitScheduledForDate(habit, cursor))
  ) {
    if (habit && !isHabitScheduledForDate(habit, cursor)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
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
      return `${habit.timesPerWeek || 0}x per week (${getTimesPerWeekDays(habit).join(", ")})`;
    case "interval":
      return `Every ${habit.intervalDays || 0} days`;
    default:
      return "Daily";
  }
};
