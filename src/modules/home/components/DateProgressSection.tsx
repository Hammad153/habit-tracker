import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";
import { formatDate } from "@/src/utils/date";

interface DateProgressSectionProps {
  percentage: number;
}

const DateProgressSection: React.FC<DateProgressSectionProps> = ({
  percentage,
}) => {
  const colors = useTheme();
  const { dayName, month, day } = formatDate(new Date());

  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="flex-row justify-between items-center py-3">
      <View>
        <View className="flex-row items-baseline mb-0.5">
          <ApText
            size="2xl"
            font="semibold"
            color={colors.textPrimary}
            className="mr-1.5"
          >
            {dayName},
          </ApText>
          <ApText size="2xl" font="semibold" color={colors.primary}>
            {month} {day}
          </ApText>
        </View>
        <ApText size="xs" color={colors.textMuted}>
          Stay consistent today
        </ApText>
      </View>

      <View className="relative items-center justify-center">
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surfaceBorder}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <ApText size="xs" font="semibold" color={colors.textPrimary}>
            {percentage}%
          </ApText>
        </View>
      </View>
    </View>
  );
};

export default DateProgressSection;
