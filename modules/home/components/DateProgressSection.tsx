import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import { formatDate } from "@/src/utils/date";

interface DateProgressSectionProps {
  percentage: number;
}

const DateProgressSection: React.FC<DateProgressSectionProps> = ({
  percentage,
}) => {
  const { dayName, month, day } = formatDate(new Date());

  const size = 60;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="flex-row justify-between items-center py-4">
      <View>
        <View className="flex-row items-baseline mb-1">
          <ApText size="3xl" font="bold" color="white" className="mr-2">
            {dayName},{" "}
          </ApText>
          <ApText size="3xl" font="bold" color={ApTheme.Color.primary}>
            {month} {day}
          </ApText>
        </View>
        <ApText size="sm" color={ApTheme.Color.textSecondary}>
          Keep up the good work!
        </ApText>
      </View>

      <View className="relative items-center justify-center">
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ApTheme.Color.surface}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ApTheme.Color.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <ApText size="xs" font="bold" color="white">
            {percentage}%
          </ApText>
        </View>
      </View>
    </View>
  );
};

export default DateProgressSection;
