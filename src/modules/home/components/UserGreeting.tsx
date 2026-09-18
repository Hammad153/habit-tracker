import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bell, Flame } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";

interface Props {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
  onJournalPress?: () => void;
  unreadCount?: number;
  streak?: number;
}

export const UserGreeting: React.FC<Props> = ({
  onNotificationPress,
  unreadCount = 0,
  streak = 0,
}) => {
  const colors = useTheme();
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between w-full pt-2 pb-4">
      <View className="flex-1 mr-3">
        <Text
          className="text-[12px] font-semibold"
          style={{ color: colors.inkTertiary }}
        >
          Embermate
        </Text>
        <Text
          className="text-[22px] font-bold mt-0.5"
          style={{ color: colors.inkPrimary }}
        >
          Your daily habits
        </Text>
        {streak > 0 && (
          <View className="flex-row items-center gap-1.5 mt-1">
            <Flame size={14} color={colors.accent} strokeWidth={2.5} />
            <Text
              className="text-[14px] font-bold"
              style={{ color: colors.accent }}
            >
              {streak} day streak
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={onNotificationPress || (() => router.push("/notifications"))}
        className="w-10 h-10 rounded-pill items-center justify-center relative active:opacity-80"
        style={{ backgroundColor: colors.surface }}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Bell size={20} color={colors.inkPrimary} strokeWidth={2} />
        {unreadCount > 0 && (
          <View
            className="w-2 h-2 rounded-full absolute top-2.5 right-2.5"
            style={{ backgroundColor: colors.accent }}
          />
        )}
      </Pressable>
    </View>
  );
};

export default UserGreeting;
