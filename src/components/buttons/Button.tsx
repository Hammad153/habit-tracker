import React from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  labelClassname?: string;
  containerClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  className = "",
  labelClassname = "",
}) => {
  const colors = useTheme();

  let containerClasses = "h-[52px] rounded-pill flex-row items-center justify-center px-6";
  let textClasses = "text-[16px] font-semibold";
  let spinnerColor = colors.inkInverse;

  if (disabled) {
    containerClasses += " bg-background-surface2";
    textClasses += " text-ink-disabled";
    spinnerColor = colors.inkDisabled;
  } else if (variant === "primary") {
    containerClasses += " bg-background-inverse active:opacity-90 active:scale-[0.97]";
    textClasses += " text-ink-inverse";
    spinnerColor = colors.inkInverse;
  } else if (variant === "secondary") {
    containerClasses += " bg-background-surface active:opacity-90";
    textClasses += " text-ink-primary";
    spinnerColor = colors.inkPrimary;
  } else if (variant === "tertiary") {
    containerClasses += " bg-transparent active:opacity-70 h-auto py-2 px-3";
    textClasses += " text-ink-primary";
    spinnerColor = colors.inkPrimary;
  } else if (variant === "destructive") {
    containerClasses += " bg-danger-soft active:opacity-90";
    textClasses += " text-danger";
    spinnerColor = colors.danger;
  }

  const widthClass = fullWidth && variant !== "tertiary" ? "w-full" : "";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`${widthClass} ${containerClasses} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${textClasses} ${labelClassname}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default Button;
