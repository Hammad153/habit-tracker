import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApContainer, ApHeader, ApScrollView, ApText, ApEmptyState } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useNotificationsState } from "./context";
import { IAppNotification } from "./model";

const iconByType: Record<IAppNotification["type"], keyof typeof Ionicons.glyphMap> = {
  habit: "checkbox-outline",
  journal: "journal-outline",
  insight: "analytics-outline",
  system: "notifications-outline",
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
      router.push(notification.route as any);
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
              <ApText size="sm" font="semibold" color={colors.primary}>
                Read all
              </ApText>
            </TouchableOpacity>
          ) : null
        }
      />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5 pb-24">
          {notifications.length === 0 ? (
            <ApEmptyState
              icon="notifications-outline"
              title="No notifications yet"
              subtitle="Habit reminders, insights, and journal nudges will appear here."
            />
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handlePress(notification)}
                activeOpacity={0.8}
                className="mb-3 rounded-2xl border p-4"
                style={{
                  backgroundColor: notification.read
                    ? colors.surface
                    : colors.primary + "12",
                  borderColor: notification.read
                    ? colors.surfaceBorder
                    : colors.primary + "40",
                }}
              >
                <View className="flex-row">
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.primary + "18" }}
                  >
                    <Ionicons
                      name={iconByType[notification.type]}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-start">
                      <ApText
                        size="base"
                        font="bold"
                        color={colors.textPrimary}
                        className="flex-1"
                      >
                        {notification.title}
                      </ApText>
                      {!notification.read && (
                        <View
                          className="ml-2 mt-1.5 h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colors.danger }}
                        />
                      )}
                    </View>
                    <ApText
                      size="sm"
                      color={colors.textSecondary}
                      className="mt-1"
                    >
                      {notification.body}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} className="mt-3">
                      {formatTime(notification.createdAt)}
                    </ApText>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default NotificationsScreen;
