export enum BadgeType {
  STREAK = "STREAK",
  MILESTONE = "MILESTONE",
}

export interface IBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: BadgeType;
}

export interface IUserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: IBadge;
}
