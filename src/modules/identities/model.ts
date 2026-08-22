export type IdentityStatus = "ACTIVE" | "ARCHIVED";

export type CompletionKind = "FULL" | "MINIMUM" | "EMERGENCY";

export interface IIdentityKindCounts {
  FULL: number;
  MINIMUM: number;
  EMERGENCY: number;
}

/** Linked-habit row as included by the API (`habitLinks.habit`). */
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

/**
 * The server returns identity fields plus a derived evidence summary spread
 * on top. Evidence is computed from completion history and can never be
 * edited directly — it only grows through showing up.
 */
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

  // ---- Derived evidence progress ----
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

export const IDENTITY_COLORS: { value: string; label: string }[] = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#EC4899", label: "Pink" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#10B981", label: "Emerald" },
  { value: "#EF4444", label: "Red" },
];
