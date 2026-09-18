import { subDays } from "date-fns";
import { IHabit } from "@/src/modules/habits/model";
import { isHabitEligibleForDate, isSameDateKey, toDateKey } from "@/src/utils/date";
import { isHabitScheduledForDate } from "@/src/utils/schedule";

export const getActiveHabits = (habits: IHabit[]) => habits.filter((habit) => !habit.isArchived);

export const getCompletionRatioForDate = (habits: IHabit[], date: Date) => {
  const eligible = getActiveHabits(habits).filter(
    (habit) => isHabitEligibleForDate(habit, date) && isHabitScheduledForDate(habit, date),
  );
  if (!eligible.length) return 0;
  const dateKey = toDateKey(date);
  const completed = eligible.filter((habit) =>
    habit.completions?.some((completion) => isSameDateKey(completion.date, dateKey) && completion.status),
  ).length;
  return completed / eligible.length;
};

export const getCompletionPercentage = (habit: IHabit, periodDays: number) => {
  const dates = Array.from({ length: periodDays }, (_, index) => subDays(new Date(), periodDays - 1 - index));
  const scheduledDates = dates.filter((date) => isHabitEligibleForDate(habit, date) && isHabitScheduledForDate(habit, date));
  if (!scheduledDates.length) return 0;
  const completed = scheduledDates.filter((date) =>
    habit.completions?.some((completion) => isSameDateKey(completion.date, toDateKey(date)) && completion.status),
  ).length;
  return Math.round((completed / scheduledDates.length) * 100);
};
