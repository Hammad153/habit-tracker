import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
}

/**
 * ProgressCircle Component
 * SVG-based circular progress indicator matching the HTML design
 */
const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 56,
}) => {
  // SVG path for circular arc (same as HTML design)
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background circle */}
        <Path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#23482f"
          strokeWidth={4}
        />
        {/* Progress circle */}
        <Path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={ApTheme.Color.primary}
          strokeWidth={4}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </Svg>
      {/* Percentage text overlay */}
      <View
        className="absolute items-center justify-center"
        style={{ width: size, height: size }}
      >
        <ApText size="xs" font="bold" color={ApTheme.Color.textPrimary}>
          {percentage}%
        </ApText>
      </View>
    </View>
  );
};

export default ProgressCircle;
