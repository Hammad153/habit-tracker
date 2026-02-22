import React from "react";
import { Habit } from "@/src/types";
import { subDays, format, isSameDay } from "date-fns";
import { View } from "react-native";
import { ApTheme } from "@/src/components/theme";
import { ApText } from "@/src/components/Text";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface CompletionChartProps {
  habits: Habit[];
  periodDays: number;
}

const CompletionChart: React.FC<CompletionChartProps> = ({
  habits,
  periodDays,
}) => {
  const today = new Date();

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");

    const activeHabits = habits.filter((h) => !h.isArchived);
    if (activeHabits.length === 0) return 0;

    const completedCount = activeHabits.filter((h) =>
      h.completions?.some((c) => c.date === dateStr && c.status),
    ).length;

    return (completedCount / activeHabits.length) * 100;
  });

  const overallCompletion = Math.round(
    chartData.reduce((a, b) => a + b, 0) / chartData.length,
  );

  // Simple trend calculation (comparing last 3 days to previous 3 days)
  const lastThree = chartData.slice(4).reduce((a, b) => a + b, 0) / 3;
  const prevThree = chartData.slice(1, 4).reduce((a, b) => a + b, 0) / 3;
  const trend = Math.round(lastThree - prevThree);

  // Generate SVG path for a 100x100 viewBox
  const points = chartData
    .map((val, i) => `${(i * 100) / 6},${100 - val}`)
    .join(" ");
  const linePath = `M ${points}`;
  const areaPath = `${linePath} L 100,100 L 0,100 Z`;

  const labels = Array.from({ length: 7 }).map((_, i) =>
    format(subDays(today, 6 - i), "EEE"),
  );

  return (
    <View
      className="p-4 rounded-3xl mb-6 relative overflow-hidden"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
        minHeight: 220,
      }}>
      <View className="flex-row justify-between items-start mb-8 z-10">
        <View>
          <ApText size="sm" color={ApTheme.Color.textMuted} className="mb-1">
            Overall Completion
          </ApText>
          <View className="flex-row items-center">
            <ApText size="3xl" font="bold" color="white" className="mr-2">
              {overallCompletion}%
            </ApText>
            {trend !== 0 && (
              <View
                className={`${trend > 0 ? "bg-green-500/20" : "bg-red-500/20"} px-2 py-0.5 rounded-full`}>
                <ApText
                  size="xs"
                  color={trend > 0 ? "#22C55E" : "#EF4444"}
                  font="bold">
                  {trend > 0 ? `+${trend}%` : `${trend}%`} this week
                </ApText>
              </View>
            )}
          </View>
        </View>
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={ApTheme.Color.textMuted}
        />
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 h-40 w-full"
        style={{ paddingBottom: 30 }}>
        <Svg
          height="100%"
          width="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={ApTheme.Color.primary}
                stopOpacity="0.5"
              />
              <Stop
                offset="1"
                stopColor={ApTheme.Color.primary}
                stopOpacity="0"
              />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#gradient)" />
          <Path
            d={linePath}
            fill="none"
            stroke={ApTheme.Color.primary}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <View className="flex-row justify-between absolute bottom-4 left-4 right-4">
        {labels.map((label, index) => (
          <ApText
            key={index}
            size="xs"
            color={ApTheme.Color.textMuted}
            style={{ fontSize: 10 }}>
            {label}
          </ApText>
        ))}
      </View>
    </View>
  );
};

export default CompletionChart;
