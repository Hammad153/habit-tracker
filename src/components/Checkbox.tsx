import React from "react";
import { View, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  size = 24,
}) => {
  const colors = useTheme();

  const content = checked ? (
    <View
      className="rounded-pill bg-accent items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Check size={Math.round(size * 0.55)} color={colors.inkInverse} strokeWidth={3} />
    </View>
  ) : (
    <View
      className="rounded-pill border-[1.6px] border-border bg-transparent"
      style={{ width: size, height: size }}
    />
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export default Checkbox;
