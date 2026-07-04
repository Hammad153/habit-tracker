import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";

interface Props {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
  unreadCount?: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: "sunny-outline" };
  if (hour < 18)
    return { text: "Good Afternoon", icon: "partly-sunny-outline" };
  return { text: "Good Evening", icon: "moon-outline" };
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const UserGreeting: React.FC<Props> = ({
  avatarUri,
  onNotificationPress,
  unreadCount = 0,
}) => {
  const { user } = useAuthState();
  const colors = useTheme();
  const greeting = getGreeting();

  return (
    <View className="flex-row items-center justify-between w-full py-4">
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center overflow-hidden"
          style={{
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <ApText size="xl" font="bold" color={colors.background}>
              {getInitials(user?.name || "HT")}
            </ApText>
          )}
        </View>

        <View className="ml-4">
          <View className="flex-row items-center mb-0.5">
            <Ionicons
              name={greeting.icon as any}
              size={12}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <ApText
              size="xs"
              font="bold"
              color={colors.primary}
              style={{ letterSpacing: 1 }}
            >
              {greeting.text.toUpperCase()}
            </ApText>
          </View>
          <ApText size="xl" font="bold" color={colors.textPrimary}>
            {user?.name || "Habit Tracker"}
          </ApText>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className="w-11 h-11 rounded-2xl items-center justify-center border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <Ionicons name="notifications" size={22} color={colors.primary} />
        {unreadCount > 0 && (
          <View
            className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full border-2 items-center justify-center px-1"
            style={{
              backgroundColor: colors.danger,
              borderColor: colors.surface,
            }}
          >
            <ApText size="xs" font="bold" color="#FFFFFF">
              {unreadCount > 9 ? "9+" : unreadCount}
            </ApText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default UserGreeting;
