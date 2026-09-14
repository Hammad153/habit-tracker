import React from "react";
import { Text, Pressable, View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export type TagVariant = "default" | "status-success" | "status-warning" | "status-danger" | "status-accent";

export interface TagProps {
  label: string;
  active?: boolean;
  variant?: TagVariant;
  onPress?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  label,
  active = false,
  variant = "default",
  onPress,
  className = "",
  icon,
}) => {
  const colors = useTheme();

  let bgClass = "bg-background-surface";
  let textClass = "text-ink-secondary";

  if (variant === "default") {
    if (active) {
      bgClass = "bg-background-inverse";
      textClass = "text-ink-inverse";
    }
  } else if (variant === "status-success" || variant === "status-accent") {
    bgClass = "bg-accent-soft";
    textClass = "text-accent";
  } else if (variant === "status-warning") {
    bgClass = "bg-warning-soft";
    textClass = "text-warning";
  } else if (variant === "status-danger") {
    bgClass = "bg-danger-soft";
    textClass = "text-danger";
  }

  const content = (
    <View
      className={`inline-flex flex-row items-center justify-center px-3.5 py-1.5 rounded-pill ${bgClass} ${className}`}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text className={`text-[12px] font-semibold ${textClass}`}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
};

export default Tag;
