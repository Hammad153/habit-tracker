import React from "react";
import { View, Text, Pressable } from "react-native";
import { Bell, Flame } from "lucide-react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";

interface Props {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
  onJournalPress?: () => void;
  unreadCount?: number;
  streak?: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export const UserGreeting: React.FC<Props> = ({
  onNotificationPress,
  unreadCount = 0,
  streak = 0,
}) => {
  const { user } = useAuthState();
  const colors = useTheme();
  const router = useRouter();
  const greetingText = getGreeting();
  const dateFormatted = format(new Date(), "EEEE, d MMMM");

  const displayName = user?.name ? `, ${user.name.split(" ")[0]}` : "";

  return (
    <View className="flex-row items-center justify-between w-full pt-2 pb-4">
      <View className="flex-1 mr-3">
        <Text className="text-[12px] font-semibold text-ink-tertiary">
          {dateFormatted}
        </Text>
        <Text className="text-[22px] font-bold text-ink-primary mt-0.5">
          {greetingText}{displayName}
        </Text>
        {streak > 0 && (
          <View className="flex-row items-center gap-1.5 mt-1">
            <Flame size={14} color={colors.accent} strokeWidth={2.5} />
            <Text className="text-[14px] font-bold text-accent">
              {streak} day streak
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={onNotificationPress || (() => router.push("/notifications"))}
        className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center relative active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Bell size={20} color={colors.inkPrimary} strokeWidth={2} />
        {unreadCount > 0 && (
          <View className="w-2 h-2 rounded-full bg-accent absolute top-2.5 right-2.5" />
        )}
      </Pressable>
    </View>
  );
};

export default UserGreeting;
