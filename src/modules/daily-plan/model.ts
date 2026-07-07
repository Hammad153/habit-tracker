import { IBaseModel } from "@/src/models";
import { IHabit } from "@/src/modules/habits/model";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "PENDING" | "COMPLETED";

export interface IDailyPlanTask extends IBaseModel {
  userId: string;
  dailyPlanId: string;
  habitId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startTime?: string;
  endTime?: string;
  sortOrder: number;
  habit?: IHabit;
}

export interface IDailyPlan extends IBaseModel {
  userId: string;
  planDate: string;
  title?: string;
  note?: string;
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
