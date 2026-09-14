import React from "react";
import { View, TouchableOpacity } from "react-native";
import { CheckSquare, BookOpen, BarChart2, Bell } from "lucide-react-native";
import { router } from "expo-router";
import { ApContainer, ApHeader, ApScrollView, ApText, ApEmptyState, ListRow } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useNotificationsState } from "./context";
import { IAppNotification } from "./model";
import { resolveNavigationRoute } from "@/src/utils/navigation";

const getNotificationIcon = (type: IAppNotification["type"]) => {
  switch (type) {
    case "habit":
      return CheckSquare;
    case "journal":
      return BookOpen;
    case "insight":
      return BarChart2;
    default:
      return Bell;
  }
};

const formatTime = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const NotificationsScreen = () => {
  const colors = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationsState();

  const handlePress = async (notification: IAppNotification) => {
    await markAsRead(notification.id);
    if (notification.route) {
      router.push(resolveNavigationRoute(notification.route) as any);
    }
  };

  return (
    <ApContainer>
      <ApHeader
        title="Notifications"
        hasBackButton
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} hitSlop={10}>
              <ApText size="sm" font="medium" color={colors.primary}>
                Read all
              </ApText>
            </TouchableOpacity>
          ) : null
        }
      />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-2 pb-6">
          {notifications.length === 0 ? (
            <ApEmptyState
              title="No notifications yet"
              subtitle="Habit reminders, insights, and journal nudges will appear here."
            />
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <View key={notification.id} className="mb-2">
                  <ListRow
                    left={
                      <View
                        className="w-9 h-9 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.accentLight }}
                      >
                        <IconComponent size={18} color={colors.primary} />
                      </View>
                    }
                    title={notification.title}
                    subtitle={`${notification.body} · ${formatTime(notification.createdAt)}`}
                    right={
                      !notification.read ? (
                        <View
                          className="w-2 h-2 rounded-full self-center"
                          style={{ backgroundColor: colors.primary }}
                        />
                      ) : undefined
                    }
                    onPress={() => handlePress(notification)}
                  />
                </View>
              );
            })
          )}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default NotificationsScreen;
