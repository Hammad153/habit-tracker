import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { useAuth } from "@/src/components/AuthContext";

interface Props {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
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

const UserGreeting: React.FC<Props> = ({ avatarUri, onNotificationPress }) => {
  const { user } = useAuth();
  const greeting = getGreeting();

  return (
    <View className="flex-row items-center justify-between w-full py-4">
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center overflow-hidden"
          style={{
            backgroundColor: ApTheme.Color.primary,
            shadowColor: ApTheme.Color.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <ApText size="xl" font="bold" color="#000">
              {getInitials(user?.name || "HT")}
            </ApText>
          )}
        </View>

        <View className="ml-4">
          <View className="flex-row items-center mb-0.5">
            <Ionicons
              name={greeting.icon as any}
              size={12}
              color={ApTheme.Color.primary}
              style={{ marginRight: 4 }}
            />
            <ApText
              size="xs"
              font="bold"
              color={ApTheme.Color.primary}
              style={{ letterSpacing: 1 }}>
              {greeting.text.toUpperCase()}
            </ApText>
          </View>
          <ApText size="xl" font="bold" color={ApTheme.Color.white}>
            {user?.name || "Habit Tracker"}
          </ApText>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        className="w-11 h-11 rounded-2xl items-center justify-center border"
        style={{
          backgroundColor: ApTheme.Color.surface,
          borderColor: ApTheme.Color.surfaceBorder,
        }}>
        <Ionicons
          name="notifications"
          size={22}
          color={ApTheme.Color.primary}
        />
        <View
          className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2"
          style={{
            backgroundColor: "#ff5252",
            borderColor: ApTheme.Color.surface,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default UserGreeting;
