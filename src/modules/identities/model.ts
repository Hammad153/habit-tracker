import { DesignTokens } from "@/src/components/theme";

export type IdentityStatus = "ACTIVE" | "ARCHIVED";

export type CompletionKind = "FULL" | "MINIMUM" | "EMERGENCY";

export interface IIdentityKindCounts {
  FULL: number;
  MINIMUM: number;
  EMERGENCY: number;
}

export interface IIdentityHabitLink {
  identityId: string;
  habitId: string;
  habit?: {
    id: string;
    title: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    isArchived: boolean;
  };
}

export interface IIdentity {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  status: IdentityStatus;
  createdAt: string;
  updatedAt: string;

  habitLinks?: IIdentityHabitLink[];
  linkedHabits?: number;
  completedOnDate?: number;
  evidencePoints?: number;
  kindCounts?: IIdentityKindCounts;
  level?: number;
  levelTitle?: string;
  nextLevelThreshold?: number | null;
  pointsToNextLevel?: number;
  progressToNextLevel?: number | null;
}

export const IDENTITY_ICONS: { name: string; label: string }[] = [
  { name: "fitness", label: "Athlete" },
  { name: "book", label: "Scholar" },
  { name: "brush", label: "Artist" },
  { name: "code-slash", label: "Builder" },
  { name: "leaf", label: "Naturalist" },
  { name: "musical-notes", label: "Musician" },
  { name: "cash", label: "Saver" },
  { name: "people", label: "Friend" },
  { name: "medkit", label: "Healer" },
  { name: "planet", label: "Explorer" },
];

export const IDENTITY_COLORS = [
  { value: DesignTokens.category.rose.ink, label: "Rose" },
  { value: DesignTokens.category.amber.ink, label: "Amber" },
  { value: DesignTokens.category.mint.ink, label: "Mint" },
  { value: DesignTokens.category.violet.ink, label: "Violet" },
  { value: DesignTokens.category.sky.ink, label: "Sky" },
  { value: DesignTokens.category.sand.ink, label: "Sand" },
];
