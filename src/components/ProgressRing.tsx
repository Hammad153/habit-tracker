import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/src/modules/settings/context";

export interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
  trackColor?: string;
  centerText?: string;
  centerSubText?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress = 0,
  size = 96,
  strokeWidth = 8,
  strokeColor,
  trackColor,
  centerText,
  centerSubText,
  children,
}) => {
  const colors = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View
      style={{ width: size, height: size }}
      className="relative items-center justify-center flex-shrink-0"
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || colors.backgroundSurface2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor || colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? (
        <View className="absolute inset-0 items-center justify-center">
          {children}
        </View>
      ) : (centerText || centerSubText) ? (
        <View className="absolute inset-0 items-center justify-center">
          {centerText ? (
            <Text className="text-[19px] font-extrabold text-ink-primary">
              {centerText}
            </Text>
          ) : null}
          {centerSubText ? (
            <Text className="text-[9.5px] font-semibold text-ink-secondary">
              {centerSubText}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default ProgressRing;
