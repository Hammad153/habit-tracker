import React from "react";
import { View, Pressable } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

interface SettingsItemProps {
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  showBorderBottom?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  icon: IconComponent,
  value,
  onPress,
  isDestructive = false,
  showBorderBottom = true,
}) => {
  const colors = useTheme();
  const itemColor = isDestructive ? colors.danger : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center py-3.5 px-4 active:opacity-75"
      style={{
        borderBottomWidth: showBorderBottom ? 1 : 0,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      {IconComponent && (
        <View className="w-7 items-center justify-center mr-3.5">
          <IconComponent
            size={20}
            color={itemColor}
            strokeWidth={1.9}
          />
        </View>
      )}
      <View className="flex-1 min-w-0">
        <ApText
          size="base"
          font="medium"
          color={itemColor}
          numberOfLines={1}
        >
          {label}
        </ApText>
      </View>
      {value ? (
        <ApText size="xs" color={colors.textMuted} font="medium">
          {value}
        </ApText>
      ) : null}
    </Pressable>
  );
};

export default SettingsItem;
