import { endOfMonth, startOfMonth } from "date-fns";
import { IHabit } from "@/src/modules/habits/model";
import { isHabitEligibleForDate, normalizeDateKey, toDateKey } from "@/src/utils/date";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import { CalendarEvent, CalendarEventStatus } from "./types";

export const getMonthDays = (month: Date) => {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const leading = first.getDay();
  return Array.from({ length: leading + last.getDate() }, (_, index) => {
    if (index < leading) return null;
    const day = new Date(first);
    day.setDate(index - leading + 1);
    return day;
  });
};

const isCompleted = (habit: IHabit, dateKey: string) =>
  habit.completions?.some((completion) => normalizeDateKey(completion.date) === dateKey && completion.status) ?? false;

export const getEventStatus = (habit: IHabit, date: Date): CalendarEventStatus => {
  const dateKey = toDateKey(date);
  if (isCompleted(habit, dateKey)) return "done";
  return dateKey < toDateKey(new Date()) ? "missed" : "upcoming";
};

export const getEventsForDate = (habits: IHabit[], date: Date): CalendarEvent[] =>
  habits.filter((habit) => !habit.isArchived && isHabitEligibleForDate(habit, date))
    .filter((habit) => isHabitScheduledForDate(habit, date))
    .map((habit) => ({ habit, status: getEventStatus(habit, date), dateKey: toDateKey(date) }));

export const getStatusForDate = (habits: IHabit[], date: Date): CalendarEventStatus | null => {
  const events = getEventsForDate(habits, date);
  if (!events.length) return null;
  if (events.every((event) => event.status === "done")) return "done";
  if (toDateKey(date) > toDateKey(new Date())) return "upcoming";
  if (events.some((event) => event.status === "done")) return "partial";
  return "missed";
};

export const getMonthLabel = (date: Date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
