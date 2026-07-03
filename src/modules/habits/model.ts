import { IBaseModel } from "@/src/models";

export interface IHabit extends IBaseModel {
  userId: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  category?: string;
  frequency?: string;
  priority?: string;
  goal: number;
  unit?: string;
  isArchived: boolean;
  scheduleType?: string; // "daily" | "specific_days" | "times_per_week" | "interval"
  scheduleDays?: string[]; // e.g., ["Mon", "Wed", "Fri"]
  timesPerWeek?: number;
  intervalDays?: number;
  restDays?: string[];
  tags?: string[];
  completions?: ICompletion[];
}

export interface ICompletion {
  id: string;
  habitId: string;
  date: string;
  status: boolean;
  value: number;
  habit?: IHabit;
}
