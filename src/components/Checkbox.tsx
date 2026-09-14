import React from "react";
import { View, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

import { ProgressRing } from "@/src/components/ProgressRing";

export interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
  size?: number;
  progress?: number; // 0 to 1
  color?: string;
  trackColor?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  size = 24,
  progress,
  color,
  trackColor,
}) => {
  const colors = useTheme();

  const isPartial = !checked && typeof progress === "number" && progress > 0;

  const content = checked ? (
    <View
      className="rounded-pill bg-accent items-center justify-center"
      style={{ width: size, height: size, backgroundColor: color || colors.accent }}
    >
      <Check size={Math.round(size * 0.55)} color={colors.inkInverse} strokeWidth={3} />
    </View>
  ) : isPartial ? (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={2.4}
      strokeColor={color || colors.accent}
      trackColor={trackColor || colors.border}
    >
      <View
        style={{
          width: Math.round(size * 0.35),
          height: Math.round(size * 0.35),
          borderRadius: 999,
          backgroundColor: color || colors.accent,
          opacity: 0.9,
        }}
      />
    </ProgressRing>
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
