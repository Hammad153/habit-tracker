import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "./Text";
import { useTheme } from "@/src/modules/settings/context";

interface IProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ApEmptyState: React.FC<IProps> = ({
  icon = "file-tray-outline",
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const colors = useTheme();

  return (
    <View className="items-center justify-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons name={icon} size={36} color={colors.textMuted} />
      </View>
      <ApText
        size="lg"
        font="bold"
        color={colors.textPrimary}
        style={{ textAlign: "center" }}
      >
        {title}
      </ApText>
      {subtitle ? (
        <ApText
          size="sm"
          color={colors.textMuted}
          style={{ textAlign: "center", marginTop: 6 }}
        >
          {subtitle}
        </ApText>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="mt-6 px-6 py-3 rounded-2xl"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText font="bold" color={colors.background}>
            {actionLabel}
          </ApText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
