import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/context/SettingsContext";

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
  const colors = useTheme();
  return (
    <View
      className="items-center m-2 flex-1"
      style={{ opacity: isLocked ? 0.5 : 1 }}>
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: isLocked
            ? colors.surfaceInactive
            : colors.primary + "1A", // 10% opacity
          borderWidth: 1,
          borderColor: isLocked ? "transparent" : colors.primary,
        }}>
        <Ionicons
          name={icon as any}
          size={32}
          color={isLocked ? colors.textMuted : colors.primary}
        />
      </View>
      <ApText
        size="sm"
        font="bold"
        color={colors.textPrimary}
        textAlign="center">
        {title}
      </ApText>
      <ApText
        size="xs"
        color={colors.textMuted}
        textAlign="center"
        numberOfLines={2}
        className="mt-1">
        {description}
      </ApText>
    </View>
  );
};

export default BadgeCard;
