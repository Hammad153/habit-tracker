import { IBaseModel } from "@/src/models";

export interface IProfile extends IBaseModel {
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  longestStreak: number;
  totalHabits: number;
  completionRate: number;
  currentStreak: number;
  neededXp: number;
  perfectDays: number;
}
