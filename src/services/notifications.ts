import * as Notifications from "expo-notifications";
import {
  BehavioralNotificationApiService,
  INotificationCandidate,
} from "@/src/modules/notifications/candidates";
import { Platform } from "react-native";
import { ApStorageService, ApStorageKeys } from "@/src/services/storage";

const REMINDER_CHANNEL_ID = "reminders";

const DAY_TO_WEEKDAY: Record<string, number> = {
  Sun: 1,
  Mon: 2,
  Tue: 3,
  Wed: 4,
  Thu: 5,
  Fri: 6,
  Sat: 7,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static ensurePermissions = async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: "Habit Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;

    const request = await Notifications.requestPermissionsAsync();
    return request.granted;
  };

  static scheduleHabitReminder = async (
    habitId: string,
    habitTitle: string,
    time: string,
    days: string[],
  ): Promise<void> => {
    if (Platform.OS === "web") return;

    await NotificationService.cancelHabitReminder(habitId);

    if (!days || days.length === 0) return;

    const granted = await NotificationService.ensurePermissions();
    if (!granted) return;

    const soundEnabledRaw = await ApStorageService.getRawItemAsync(
      ApStorageKeys.SoundEnabled,
    );
    const soundEnabled = soundEnabledRaw !== "false"; // default on

    const [hourStr, minuteStr] = time.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;

    for (const day of days) {
      const weekday = DAY_TO_WEEKDAY[day];
      if (!weekday) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Habit Reminder",
          body: `Time to ${habitTitle}`,
          sound: soundEnabled,
          data: { habitId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
    }
  };

  /**
   * Phase 3.7 — schedules backend-decided behavioral candidates as LOCAL
   * notifications (short delay, quiet hours already enforced server-side).
   * Delivery fingerprints are confirmed back so the server cooldown ledger
   * prevents repeat surfacing.
   */
  static scheduleBehavioralCandidates = async (
    candidates: Array<{
      fingerprint: string;
      type: INotificationCandidate["type"];
      priority: INotificationCandidate["priority"];
      title: string;
      body: string;
      action: { route: string };
    }>,
  ): Promise<void> => {
    if (Platform.OS === "web") return;
    if (!candidates?.length) return;

    const granted = await NotificationService.ensurePermissions();
    if (!granted) return;

    for (const c of candidates) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: c.title,
          body: c.body,
          data: { behavioral: true, route: c.action.route, type: c.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: c.priority === "URGENT" ? 5 : 30,
        },
      });
    }

    // Fire-and-forget confirmation; server ledger is the correctness source.
    BehavioralNotificationApiService.markDelivered(
      candidates.map((c) => ({
        fingerprint: c.fingerprint,
        type: c.type,
        priority: c.priority,
      })),
    ).catch(() => undefined);
  };

  /**
   * Cancels every scheduled notification belonging to a habit.
   */
  static cancelHabitReminder = async (habitId: string): Promise<void> => {
    if (Platform.OS === "web") return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.habitId === habitId)
        .map((n) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
    );
  };

  /**
   * Rebuilds all local reminder notifications from the server-side reminder
   * list. Called after login so reminders survive reinstalls / new devices
   * and stay in sync with the backend as the source of truth.
   */
  static syncAllReminders = async (
    reminders: {
      habitId: string;
      time: string;
      days: string[];
      enabled: boolean;
      habit?: { title?: string };
    }[],
  ): Promise<void> => {
    if (Platform.OS === "web") return;
    if (!reminders || reminders.length === 0) return;

    const granted = await NotificationService.ensurePermissions();
    if (!granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      await NotificationService.scheduleHabitReminder(
        reminder.habitId,
        reminder.habit?.title || "your habit",
        reminder.time,
        reminder.days,
      );
    }
  };
}
