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
