import React, { useMemo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { ApText } from "@/src/components/Text";
import { Completion } from "@/src/types";
import { ApTheme } from "@/src/components/theme";

interface HabitBreakdownCardProps {
  title: string;
  category: string;
  percentage: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  completions?: Completion[];
}

const HabitBreakdownCard: React.FC<HabitBreakdownCardProps> = ({
  title,
  category,
  percentage,
  icon,
  iconBg,
  iconColor,
  completions = [],
}) => {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const last7DaysCompleted = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      return completions.some((c) => c.date === dateStr && c.status);
    });
  }, [completions]);

  return (
    <View
      className="p-4 rounded-2xl mb-3"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: iconBg }}
          >
            <Ionicons name={icon as any} size={20} color={iconColor} />
          </View>
          <View>
            <ApText size="base" font="bold" color="white">
              {title}
            </ApText>
            <ApText size="xs" color={ApTheme.Color.textMuted}>
              {category}
            </ApText>
          </View>
        </View>

        <View className="flex-row items-center">
          <ApText size="lg" font="bold" color="white" className="mr-2">
            {percentage}%
          </ApText>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={ApTheme.Color.surfaceInactive}
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
        </View>
      </View>

      {/* Consistency Bars — last 7 days */}
      <View className="flex-row justify-between h-2 gap-1 px-1">
        {last7DaysCompleted.map((completed, i) => (
          <View
            key={i}
            className="flex-1 rounded-full"
            style={{
              backgroundColor: completed
                ? ApTheme.Color.primary
                : ApTheme.Color.surfaceInactive,
              opacity: 0.8,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HabitBreakdownCard;
