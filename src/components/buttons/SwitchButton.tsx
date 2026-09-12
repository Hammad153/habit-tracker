import React, { useEffect, useRef } from "react";
import { Pressable, Animated } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";

export interface SwitchButtonProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  value,
  onValueChange,
  disabled = false,
  className = "",
}) => {
  const colors = useTheme();
  const { triggerSelection } = useFeedback();
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      bounciness: 2,
      speed: 16,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const handlePress = () => {
    if (disabled) return;
    triggerSelection();
    onValueChange(!value);
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const trackBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      colors.borderStrong || colors.inkDisabled,
      colors.accent || colors.primary,
    ],
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      className={`items-center justify-center ${disabled ? "opacity-50" : "active:opacity-85"} ${className}`}
      style={{ width: 48, height: 28 }}
    >
      <Animated.View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: trackBg,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.inkInverse || colors.white,
            transform: [{ translateX }],
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1.5 },
            elevation: 3,
          }}
        />
      </Animated.View>
    </Pressable>
  );
};

export const ToggleButton = SwitchButton;
export default SwitchButton;
