import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

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

const UserGreeting: React.FC<Props> = ({
  userName = "Habit Tracker",
  avatarUri,
  onNotificationPress,
}) => {
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
            <Ionicons
              name="person"
              size={22}
              color={ApTheme.Color.background}
            />
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
            {userName}
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
          color={ApTheme.Color.white}
        />
      </TouchableOpacity>
    </View>
  );
};

export default UserGreeting;
