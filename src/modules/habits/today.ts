import { IHabit } from './model';
import { isHabitScheduledForDate } from '@/src/utils/schedule';
import { isSameDateKey, toDateKey } from '@/src/utils/date';

export const getTodaySections = (habits: IHabit[], date: Date) => {
  const key = toDateKey(date);
  const due: IHabit[] = [];
  const completed: IHabit[] = [];
  const notScheduled: IHabit[] = [];
  const paused: IHabit[] = [];

  for (const habit of habits) {
    if (habit.lifecycleStatus === 'PAUSED') {
      paused.push(habit);
    } else if (!habit.isArchived && (!habit.lifecycleStatus || habit.lifecycleStatus === 'ACTIVE')) {
      if (!isHabitScheduledForDate(habit, date)) {
        notScheduled.push(habit);
      } else if (habit.completions?.some((entry) => entry.status && isSameDateKey(entry.date, key))) {
        completed.push(habit);
      } else {
        due.push(habit);
      }
    }
  }
  return { due, completed, notScheduled, paused };
};
