import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/context/SettingsContext";

interface SettingsItemProps {
  label: string;
  icon: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  icon,
  value,
  onPress,
  isDestructive = false,
}) => {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 border-b px-3"
      style={{
        borderBottomColor: colors.surfaceBorder,
        opacity: onPress ? 1 : 1,
      }}>
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: colors.surface }}>
        <Ionicons
          name={icon as any}
          size={20}
          color={isDestructive ? colors.danger : colors.primary}
        />
      </View>
      <View className="flex-1">
        <ApText
          size="base"
          font="medium"
          color={isDestructive ? colors.danger : colors.textPrimary}>
          {label}
        </ApText>
      </View>
      {value && (
        <ApText size="sm" color={colors.textMuted} className="mr-2">
          {value}
        </ApText>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
};

export default SettingsItem;
