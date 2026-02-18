import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

interface BadgeCardProps {
  title: string;
  icon: string;
  description: string;
  isLocked?: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  icon,
  description,
  isLocked = false,
}) => {
  return (
    <View
      className="items-center m-2 flex-1"
      style={{ opacity: isLocked ? 0.5 : 1 }}
    >
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: isLocked
            ? ApTheme.Color.surfaceInactive
            : "rgba(19, 236, 91, 0.1)",
          borderWidth: 1,
          borderColor: isLocked ? "transparent" : ApTheme.Color.primary,
        }}
      >
        <Ionicons
          name={icon as any}
          size={32}
          color={isLocked ? ApTheme.Color.textMuted : ApTheme.Color.primary}
        />
      </View>
      <ApText size="sm" font="bold" color="white" textAlign="center">
        {title}
      </ApText>
      <ApText
        size="xs"
        color={ApTheme.Color.textMuted}
        textAlign="center"
        numberOfLines={2}
        className="mt-1"
      >
        {description}
      </ApText>
    </View>
  );
};

export default BadgeCard;
