export type SubscriptionTier = "TRIAL" | "BASIC" | "PREMIUM";

export type BillingInterval = "MONTHLY" | "YEARLY";

/** Every feature the backend can grant/deny (server-authoritative). */
export interface IEntitlements {
  unlimitedHabits: boolean;
  dailyPlan: boolean;
  journal: boolean;
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  badgesAndXp: boolean;
  smartReminders: boolean;
  dataExport: boolean;
  customThemes: boolean;
  aiCoach: boolean;
  rewards: boolean;
  identities: boolean;
}

/**
 * Mirror of the backend GET /subscription payload. `accessGranted` is decided
 * by the server — the UI only reflects it (the real gate is backend-side).
 */
export interface ISubscriptionInfo {
  currentPlan: string;
  tier: SubscriptionTier;
  status: string;
  accessGranted: boolean;
  habitLimit: number; // -1 = unlimited
  currentHabitCount: number;
  canCreateHabit: boolean;
  currency: string;
  amount: number | null;
  billingInterval: BillingInterval | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  gracePeriodEndsAt: string | null;
  paymentMethodNeedsUpdate: boolean;
  nextBillingDate: string | null;
  entitlements: IEntitlements;
}

export interface IPlan {
  id: string;
  tier: "TRIAL" | "BASIC" | "PREMIUM";
  displayName: string;
  billingInterval: BillingInterval;
  amount: number; // whole Naira
  currency: string;
  tagline: string;
  mostPopular: boolean;
  annualSavings: number | null;
}

export interface IPlansResponse {
  currency: string;
  trialDurationDays: number;
  plans: IPlan[];
}

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  TRIAL: "Free Trial",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

export const PLAN_ID_TO_TIER: Record<string, SubscriptionTier> = {
  TRIAL: "TRIAL",
  BASIC_MONTHLY: "BASIC",
  BASIC_YEARLY: "BASIC",
  PREMIUM_MONTHLY: "PREMIUM",
  PREMIUM_YEARLY: "PREMIUM",
};

/** Marketing copy for plan cards (entitlements decide actual access). */
export const TIER_FEATURES: Record<
  Exclude<SubscriptionTier, "TRIAL">,
  { label: string; premiumOnly?: boolean }[]
> = {
  BASIC: [
    { label: "Unlimited habits" },
    { label: "Daily plan & journal" },
    { label: "Badges, XP & rewards" },
    { label: "Smart reminders" },
    { label: "Data export" },
  ],
  PREMIUM: [
    { label: "Everything in Basic" },
    { label: "AI Habit Coach" },
    { label: "Advanced analytics" },
    { label: "Custom themes" },
    { label: "Deeper daily insights" },
  ],
};