export enum BadgeType {
  STREAK = "STREAK",
  MILESTONE = "MILESTONE",
}

export interface User {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  completions?: Completion[];
}

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  status: boolean;
  value: number;
  habit?: Habit;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: BadgeType;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}
