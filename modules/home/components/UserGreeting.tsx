import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import { useAuth } from "@/src/components/AuthContext";

interface Props {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const UserGreeting: React.FC<Props> = ({
  userName = "Habit Tracker",
  avatarUri,
  onNotificationPress,
}) => {
  const user = useAuth();
  return (
    <View className="flex-row items-center justify-between w-full py-2">
      <View className="flex-row items-center">
        <View
          className="w-11 h-11 rounded-full items-center justify-center overflow-hidden"
          style={{ backgroundColor: ApTheme.Color.primary }}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <ApText size="xl" font="bold" color={ApTheme.Color.white}>
              {getInitials(user?.user?.name || "USER")}
            </ApText>
          )}
        </View>

        <View className="ml-3">
          <ApText
            size="xs"
            font="medium"
            color={ApTheme.Color.textSecondary}
            style={{ letterSpacing: 0.5 }}
          >
            {getGreeting()}
          </ApText>
          <ApText size="base" font="bold" color={ApTheme.Color.white}>
            {user?.user?.name || "USER"}
          </ApText>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: ApTheme.Color.surface }}
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={ApTheme.Color.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default UserGreeting;
