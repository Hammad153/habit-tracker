import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { IHabit, ICompletion } from "../model";
import { toDateKey, parseDateKey, isSameDateKey } from "@/src/utils/date";
import { subDays, format, startOfWeek, addDays, isSameDay } from "date-fns";

interface HabitMetricsProps {
  habits: IHabit[];
}

interface DailyStats {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

const HabitMetrics: React.FC<HabitMetricsProps> = ({ habits }) => {
  const colors = useTheme();

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const days: DailyStats[] = [];

    // Calculate stats for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = toDateKey(date);

      let completed = 0;
      let total = 0;

      habits.forEach((habit) => {
        if (habit.isArchived) return;

        // Check if habit was created before this date
        if (habit.createdAt) {
          const createdDate = parseDateKey(habit.createdAt);
          if (date < createdDate) return;
        }

        total++;
        const completion = habit.completions?.find((c) =>
          isSameDateKey(c.date, dateKey)
        );
        if (completion?.status) {
          completed++;
        }
      });

      days.push({
        date: dateKey,
        completed,
        total,
        rate: total > 0 ? (completed / total) * 100 : 0,
      });
    }

    return days;
  }, [habits]);

  const weeklyStats = useMemo(() => {
    const totalCompletions = stats.reduce((sum, day) => sum + day.completed, 0);
    const totalPossible = stats.reduce((sum, day) => sum + day.total, 0);
    const avgRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
    const perfectDays = stats.filter((day) => day.rate === 100).length;
    const currentStreak = calculateStreak(stats);

    return {
      totalCompletions,
      avgRate,
      perfectDays,
      currentStreak,
      totalHabits: habits.filter((h) => !h.isArchived).length,
    };
  }, [stats, habits]);

  const maxValue = useMemo(() => {
    return Math.max(...stats.map((s) => s.total), 1);
  }, [stats]);

  const chartWidth = 280;
  const chartHeight = 100;
  const barWidth = chartWidth / 7 - 12;
  const barGap = 8;

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  const chartPath = useMemo(() => {
    let path = "";
    stats.forEach((stat, index) => {
      const x = index * (barWidth + barGap) + barWidth / 2;
      const y = chartHeight - getBarHeight(stat.completed);
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  }, [stats]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <ApText font="semibold" className="text-base" style={{ color: colors.textPrimary }}>
          This Week
        </ApText>
        <View className="flex-row items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: colors.primary + "15" }}>
          <Ionicons name="trending-up" size={14} color={colors.primary} />
          <ApText font="medium" className="text-xs" style={{ color: colors.primary }}>
            {weeklyStats.avgRate.toFixed(0)}% avg
          </ApText>
        </View>
      </View>

      {/* Chart */}
      <View className="mb-4 items-center">
        <Svg width={chartWidth} height={chartHeight + 20}>
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => (
            <Line
              key={i}
              x1={0}
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke={colors.surfaceBorder}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Bars */}
          {stats.map((stat, index) => {
            const barHeight = getBarHeight(stat.completed);
            const x = index * (barWidth + barGap);
            const y = chartHeight - barHeight;
            const isToday = isSameDay(parseDateKey(stat.date), new Date());

            return (
              <React.Fragment key={stat.date}>
                {/* Bar background */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={isToday ? colors.primary + "30" : colors.surfaceBorder + "40"}
                />
                {/* Bar fill */}
                {stat.completed > 0 && (
                  <Rect
                    x={x + 2}
                    y={y + 2}
                    width={barWidth - 4}
                    height={barHeight - 2}
                    rx={3}
                    fill={isToday ? colors.primary : colors.primary + "80"}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Line chart overlay */}
          <Path
            d={chartPath}
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {stats.map((stat, index) => {
            const x = index * (barWidth + barGap) + barWidth / 2;
            const y = chartHeight - getBarHeight(stat.completed);
            const isToday = isSameDay(parseDateKey(stat.date), new Date());

            if (stat.completed === 0) return null;

            return (
              <Circle
                key={`point-${stat.date}`}
                cx={x}
                cy={y}
                r={4}
                fill={isToday ? colors.primary : colors.surface}
                stroke={colors.primary}
                strokeWidth={2}
              />
            );
          })}

          {/* Day labels */}
          {stats.map((stat, index) => {
            const x = index * (barWidth + barGap) + barWidth / 2;
            const dayName = format(parseDateKey(stat.date), "EEE")[0];

            return (
              <SvgText
                key={`label-${stat.date}`}
                x={x}
                y={chartHeight + 16}
                fontSize={10}
                fill={colors.textSecondary}
                textAnchor="middle"
              >
                {dayName}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-2">
        <StatCard
          icon="checkmark-circle"
          label="Completed"
          value={weeklyStats.totalCompletions.toString()}
          color={colors.success}
          colors={colors}
        />
        <StatCard
          icon="flame"
          label="Streak"
          value={`${weeklyStats.currentStreak}d`}
          color={colors.warning}
          colors={colors}
        />
        <StatCard
          icon="star"
          label="Perfect Days"
          value={weeklyStats.perfectDays.toString()}
          color={colors.primary}
          colors={colors}
        />
        <StatCard
          icon="list"
          label="Active"
          value={weeklyStats.totalHabits.toString()}
          color={colors.surface}
          colors={colors}
        />
      </View>
    </View>
  );
};

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  colors: any;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, colors }) => (
  <View className="flex-1 items-center rounded-xl py-2" style={{ backgroundColor: color + "10" }}>
    <Ionicons name={icon as any} size={16} color={color} />
    <ApText font="bold" className="mt-1 text-sm" style={{ color: colors.textPrimary }}>
      {value}
    </ApText>
    <ApText font="normal" className="text-xs" style={{ color: colors.textSecondary }}>
      {label}
    </ApText>
  </View>
);

function calculateStreak(stats: DailyStats[]): number {
  let streak = 0;
  // Count backwards from today
  for (let i = stats.length - 1; i >= 0; i--) {
    if (stats[i].completed > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default HabitMetrics;