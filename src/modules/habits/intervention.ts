import axiosInstance from "@/src/libs/axios";

/** Deterministic intervention taxonomy returned by the backend engine. */
export type InterventionType =
  | "RECOVERY"
  | "REDUCE_DIFFICULTY"
  | "USE_MINIMUM_VERSION"
  | "USE_EMERGENCY_VERSION"
  | "HABIT_STACK"
  | "CHANGE_TIME"
  | "CHANGE_CUE"
  | "REINFORCE_IDENTITY"
  | "PROTECT_MOMENTUM"
  | "PREPARE_FOR_RISK"
  | "NO_INTERVENTION";

export type InterventionActionType =
  | "USE_MINIMUM_VERSION"
  | "USE_EMERGENCY_VERSION"
  | "OPEN_HABIT_EDIT"
  | "CONFIGURE_HABIT_STACK"
  | "REVIEW_ACTIVE_HABITS"
  | "NONE";

export interface IIntervention {
  type: InterventionType;
  priority: number;
  category: "INFORMATIONAL" | "USER_ACTION_REQUIRED";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  reason: string;
  suggestedAction: { type: InterventionActionType };
  sourceSignals: string[];
  /** Stable per (user, habit, type, week) — used to suppress repeat display. */
  fingerprint: string;
  facts: Record<string, string | number | boolean | null>;
}

export class InterventionApiService {
  /**
   * The single recommended intervention for a habit (or null).
   * `date` is an optional YYYY-MM-DD client-local key; omitting it lets the
   * server use its day-key convention.
   */
  static getForHabit = (habitId: string, date?: string) => {
    return axiosInstance
      .get(`/analytics/habits/${habitId}/intervention`, {
        params: date ? { date } : undefined,
      })
      .then((res) => res.data as { intervention: IIntervention | null });
  };
}
