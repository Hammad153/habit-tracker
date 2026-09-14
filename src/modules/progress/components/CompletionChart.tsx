import React from "react";
import { Habit } from "@/src/types";
import { subDays, format } from "date-fns";
import { View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import { ApText } from "@/src/components/Text";
import { ApCard } from "@/src/components/Card";
import Svg, { Path, Defs, LinearGradient, Stop, Line } from "react-native-svg";
import { isSameDateKey, isHabitEligibleForDate } from "@/src/utils/date";

interface CompletionChartProps {
  habits: Habit[];
  periodDays: number;
}

const CompletionChart: React.FC<CompletionChartProps> = ({
  habits,
  periodDays,
}) => {
  const colors = useTheme();
  const today = new Date();

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");

    const eligibleHabits = habits.filter((h) => !h.isArchived && isHabitEligibleForDate(h, date));
    if (eligibleHabits.length === 0) return 0;

    const completedCount = eligibleHabits.filter((h) =>
      h.completions?.some((c) => isSameDateKey(c.date, dateStr) && c.status),
    ).length;

    return (completedCount / eligibleHabits.length) * 100;
  });

  const overallCompletion = Math.round(
    chartData.reduce((a, b) => a + b, 0) / chartData.length,
  );

  const lastThree = chartData.slice(4).reduce((a, b) => a + b, 0) / 3;
  const prevThree = chartData.slice(1, 4).reduce((a, b) => a + b, 0) / 3;
  const trend = Math.round(lastThree - prevThree);

  // Generate SVG path for a 100x100 viewBox
  const points = chartData
    .map((val, i) => `${(i * 100) / 6},${100 - Math.max(val, 2)}`)
    .join(" ");
  const linePath = `M ${points}`;
  const areaPath = `${linePath} L 100,100 L 0,100 Z`;

  const labels = Array.from({ length: 7 }).map((_, i) =>
    format(subDays(today, 6 - i), "EEE"),
  );

  return (
    <ApCard className="p-4 mb-6 relative overflow-hidden" style={{ minHeight: 220 }}>
      <View className="flex-row justify-between items-start mb-6 z-10">
        <View>
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="uppercase mb-1"
            style={{ letterSpacing: 0.8 }}
          >
            Overall Completion
          </ApText>
          <View className="flex-row items-baseline">
            <ApText
              size="3xl"
              font="semibold"
              color={colors.textPrimary}
              className="mr-2"
              style={{ letterSpacing: -0.5 }}
            >
              {overallCompletion}%
            </ApText>
            {trend !== 0 && (
              <ApText
                size="xs"
                font="medium"
                color={trend > 0 ? colors.success : colors.danger}
              >
                {trend > 0 ? `+${trend}%` : `${trend}%`} this week
              </ApText>
            )}
          </View>
        </View>
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 h-36 w-full"
        style={{ paddingBottom: 28 }}
      >
        <Svg
          height="100%"
          width="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="0.2" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {/* Grid lines */}
          <Line x1="0" y1="25" x2="100" y2="25" stroke={colors.surfaceBorder} strokeWidth="0.5" />
          <Line x1="0" y1="50" x2="100" y2="50" stroke={colors.surfaceBorder} strokeWidth="0.5" />
          <Line x1="0" y1="75" x2="100" y2="75" stroke={colors.surfaceBorder} strokeWidth="0.5" />
          <Path d={areaPath} fill="url(#chartGradient)" />
          <Path
            d={linePath}
            fill="none"
            stroke={colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <View className="flex-row justify-between absolute bottom-3 left-4 right-4">
        {labels.map((label, index) => (
          <ApText
            key={index}
            size="xs"
            color={colors.textMuted}
            style={{ fontSize: 11 }}
          >
            {label}
          </ApText>
        ))}
      </View>
    </ApCard>
  );
};

export default CompletionChart;
