import { IHabit } from "@/src/modules/habits/model";

export type CalendarEventStatus = "done" | "missed" | "upcoming" | "partial";

export interface CalendarEvent {
  habit: IHabit;
  status: CalendarEventStatus;
  dateKey: string;
}
