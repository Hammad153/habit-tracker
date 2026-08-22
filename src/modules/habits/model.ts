import { IBaseModel } from "@/src/models";
import { CompletionKind } from "@/src/modules/identities/model";

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
  scheduleType?: string; // "daily" | "specific_days" | "times_per_week" | "interval"
  scheduleDays?: string[]; // e.g., ["Mon", "Wed", "Fri"]
  timesPerWeek?: number;
  intervalDays?: number;
  restDays?: string[];
  tags?: string[];
  completions?: ICompletion[];
  startDate?: string; // ISO date string for temporary habits
  endDate?: string; // ISO date string - habit auto-deletes after this date
  // ---- Behavioral layer (Phase 1) ----
  /** Implementation intention cue time, e.g. "07:30". */
  scheduledTime?: string | null;
  /** Where the behavior happens, e.g. "in the kitchen". */
  location?: string | null;
  /** The full target behavior description. */
  fullBehavior?: string | null;
  /** A two-minute-or-less fallback version. */
  minimumBehavior?: string | null;
  /** The bare-minimum version for crisis days. */
  emergencyMinimum?: string | null;
  /** Habit this one stacks after ("After [X], I will [Y]"). */
  stackAfterHabitId?: string | null;
  stackAfter?: IHabit | null;
  identityLinks?: { identityId: string; habitId: string }[];
}

export interface ICompletion {
  id: string;
  habitId: string;
  date: string;
  status: boolean;
  value: number;
  kind: CompletionKind;
  habit?: IHabit;
}
