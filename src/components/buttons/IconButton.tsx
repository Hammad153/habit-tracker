import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface IconButtonProps {
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
  className?: string;
  children?: React.ReactNode;
  iconColor?: string;
}

export const ApIconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onPress,
  size = 20,
  accessibilityLabel,
  className = "",
  children,
  iconColor,
}) => {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80 ${className}`}
    >
      {Icon && <Icon size={size} color={iconColor || colors.inkPrimary} strokeWidth={2} />}
      {children}
    </Pressable>
  );
};

export default ApIconButton;
