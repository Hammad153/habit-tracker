import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  BehavioralEventApiService,
  BehavioralNotificationApiService,
  INotificationCandidate,
} from "./candidates";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import { useAuthState } from "@/src/modules/auth/context";
import { IAppNotification } from "./model";

interface IProps {
  children: ReactNode;
}

type NotificationInput = Omit<IAppNotification, "id" | "userId" | "read" | "createdAt">;

type TNotificationsContext = {
  notifications: IAppNotification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  addNotification: (input: NotificationInput) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationsContext = createContext<TNotificationsContext | undefined>(undefined);

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const useNotificationsState = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsState must be used within the NotificationsProvider");
  }
  return context;
};

export const NotificationsProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [allNotifications, setAllNotifications] = useState<IAppNotification[]>([]);

  // Phase 3.7 deep links + Phase 4.1 NOTIFICATION_OPENED attribution.
  // The deliveryId is resolved SERVER-SIDE from the server-issued
  // fingerprint; the app can never invent one.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          route?: string;
          type?: INotificationCandidate["type"];
          fingerprint?: string;
        };
        if (data.fingerprint && data.type) {
          BehavioralNotificationApiService.markDelivered([
            { fingerprint: data.fingerprint, type: data.type, priority: "HIGH" },
          ])
            .then((res) => {
              const match = res.deliveries?.find(
                (d) => d.fingerprint === data.fingerprint,
              );
              if (match?.id) {
                BehavioralEventApiService.notificationOpened(match.id);
              }
            })
            .catch(() => undefined);
        }
        if (typeof data.route === "string" && data.route.startsWith("/")) {
          router.push(data.route as never);
        }
      },
    );
    return () => sub.remove();
  }, []);

  const persist = async (nextNotifications: IAppNotification[]) => {
    setAllNotifications(nextNotifications);
    await ApStorageService.setItemAsync(
      ApStorageKeys.AppNotifications,
      nextNotifications,
    );
  };

  const fetchNotifications = async () => {
    const stored = await ApStorageService.getItemAsync(ApStorageKeys.AppNotifications);
    setAllNotifications(Array.isArray(stored) ? stored : []);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const notifications = useMemo(
    () =>
      allNotifications
        .filter((notification) => notification.userId === user?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allNotifications, user?.id],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const addNotification = async (input: NotificationInput) => {
    if (!user?.id) return;
    const notification: IAppNotification = {
      ...input,
      id: createId(),
      userId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await persist([notification, ...allNotifications].slice(0, 80));
  };

  const markAsRead = async (id: string) => {
    await persist(
      allNotifications.map((notification) =>
        notification.id === id && notification.userId === user?.id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = async () => {
    await persist(
      allNotifications.map((notification) =>
        notification.userId === user?.id ? { ...notification, read: true } : notification,
      ),
    );
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
