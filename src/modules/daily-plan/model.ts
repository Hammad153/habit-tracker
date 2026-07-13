import { IBaseModel } from "@/src/models";
import { IHabit } from "@/src/modules/habits/model";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "PENDING" | "COMPLETED" | "SKIPPED";
export type DailyPlanStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface IDailyPlanTask extends IBaseModel {
  userId: string;
  dailyPlanId: string;
  habitId?: string;
  linkedHabitId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  sortOrder: number;
  order?: number;
  completedAt?: string;
  habit?: IHabit;
  linkedHabit?: { id: string; name: string; title?: string };
}

export interface IDailyPlan extends IBaseModel {
  userId: string;
  planDate: string;
  title?: string;
  note?: string;
  status?: DailyPlanStatus;
  totalItems?: number;
  completedItems?: number;
  progressPercentage?: number;
  nextItem?: IDailyPlanTask;
  dayStartTime?: string;
  dayEndTime?: string;
  items?: IDailyPlanTask[];
  tasks: IDailyPlanTask[];
}

export interface IDailyPlanSummary {
  plan: IDailyPlan | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  highPriorityOpen: number;
}
