export interface IReminder {
  id: string;
  userId: string;
  habitId: string;
  time: string; // HH:mm
  days: string[];
  enabled: boolean;
  habit?: {
    title: string;
    icon: string;
    iconColor: string;
  };
}

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
