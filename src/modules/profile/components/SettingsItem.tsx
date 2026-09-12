import React from "react";
import { View, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

interface SettingsItemProps {
  label: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  icon: IconComponent,
  value,
  onPress,
  isDestructive = false,
}) => {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5 px-4"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      {IconComponent && (
        <View className="mr-3">
          <IconComponent
            size={18}
            color={isDestructive ? colors.danger : colors.textMuted}
          />
        </View>
      )}
      <View className="flex-1">
        <ApText
          size="sm"
          font="medium"
          color={isDestructive ? colors.danger : colors.textPrimary}
        >
          {label}
        </ApText>
      </View>
      {value && (
        <ApText size="xs" color={colors.textMuted} className="mr-2">
          {value}
        </ApText>
      )}
      {!isDestructive && (
        <ChevronRight size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
};

export default SettingsItem;
