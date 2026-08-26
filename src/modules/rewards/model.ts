export enum BundleStatus {
  LOCKED = "LOCKED",
  UNLOCKED = "UNLOCKED",
  USED = "USED",
}

/** Mirrors the backend RewardEngine breakdown lines. */
export interface IRewardBreakdownLine {
  code: string;
  label: string;
  amount: number;
}

export interface IRewardBreakdown {
  total: number;
  lines: IRewardBreakdownLine[];
  streak: number;
  newStreakMilestones: number[];
  newIdentityMilestones: string[];
}

export interface IRewardBalance {
  balance: number;
  cachedBalance: number;
  consistent: boolean;
}

export interface IRewardTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export interface IShopListItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  cost: number;
  type: string;
  owned: boolean;
}

export interface IRedeemResult {
  redemption: { id: string; itemId: string };
  remainingCoins: number;
}

export interface IFreezeResult {
  id: string;
  habitId: string;
  date: string;
  cost: number;
}

export interface ITemptationBundle {
  id: string;
  habitId: string;
  title: string;
  description: string | null;
  status: BundleStatus;
  usedAt: string | null;
  unlockedAt: string | null;
}
