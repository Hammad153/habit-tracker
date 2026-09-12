import React from "react";
import { View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface ProgressBarProps {
  progress: number; // 0 to 1
  tone?: "neutral" | "accent" | "warning" | "danger";
  height?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  tone = "neutral",
  height = 5,
  className = "",
}) => {
  const colors = useTheme();
  const clamped = Math.min(100, Math.max(0, progress * 100));

  let fillClass = "bg-ink-primary";
  if (tone === "accent") fillClass = "bg-accent";
  if (tone === "warning") fillClass = "bg-warning";
  if (tone === "danger") fillClass = "bg-danger";

  return (
    <View
      className={`w-full bg-background-surface2 rounded-pill overflow-hidden ${className}`}
      style={{ height }}
    >
      <View
        className={`h-full rounded-pill ${fillClass}`}
        style={{ width: `${clamped}%` }}
      />
    </View>
  );
};

export default ProgressBar;
