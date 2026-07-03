export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

export interface ISubscriptionInfo {
  tier: SubscriptionTier;
  habitLimit: number; // -1 means unlimited
  currentHabitCount: number;
  canCreateHabit: boolean;
}

export const FREE_SUBSCRIPTION: ISubscriptionInfo = {
  tier: SubscriptionTier.FREE,
  habitLimit: 5,
  currentHabitCount: 0,
  canCreateHabit: true,
};

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: "Free",
  [SubscriptionTier.BASIC]: "Basic",
  [SubscriptionTier.PREMIUM]: "Premium",
};

export const TIER_PRICES: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: "$0",
  [SubscriptionTier.BASIC]: "$3.99/mo",
  [SubscriptionTier.PREMIUM]: "$7.99/mo",
};

export interface ITierFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  premium: boolean | string;
}

export const TIER_FEATURES: ITierFeature[] = [
  {
    name: "Track habits",
    free: "Up to 5",
    basic: "Unlimited",
    premium: "Unlimited",
  },
  { name: "Basic analytics", free: true, basic: true, premium: true },
  { name: "Badges & XP", free: true, basic: true, premium: true },
  { name: "Smart reminders", free: false, basic: true, premium: true },
  { name: "Data export", free: false, basic: true, premium: true },
  { name: "Custom themes", free: false, basic: false, premium: true },
  { name: "AI Habit Coach", free: false, basic: false, premium: true },
  { name: "Advanced analytics", free: false, basic: false, premium: true },
];
