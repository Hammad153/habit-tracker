export type AppNotificationType = "habit" | "journal" | "insight" | "system";

export interface IAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: AppNotificationType;
  route?: string;
  read: boolean;
  createdAt: string;
}
