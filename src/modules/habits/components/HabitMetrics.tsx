import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import { IHabit } from "../model";
import { toDateKey, isSameDateKey } from "@/src/utils/date";
import { startOfWeek, addDays } from "date-fns";

interface HabitMetricsProps {
  habits: IHabit[];
}

export const HabitMetrics: React.FC<HabitMetricsProps> = ({ habits }) => {
  const colors = useTheme();

  const { totalCompletions, avgRate, dayStats } = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Mon
    const days = [];

    const activeHabits = habits.filter((h) => !h.isArchived);

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = toDateKey(date);

      let completed = 0;
      let total = activeHabits.length;

      activeHabits.forEach((h) => {
        const c = h.completions?.find((comp) => isSameDateKey(comp.date, dateKey));
        if (c?.status) completed++;
      });

      const rate = total > 0 ? completed / total : 0;
      days.push({
        label: ["M", "T", "W", "T", "F", "S", "S"][i],
        completed,
        total,
        rate,
        isToday: isSameDateKey(dateKey, toDateKey(today)),
      });
    }

    const completions = days.reduce((sum, d) => sum + d.completed, 0);
    const possible = days.reduce((sum, d) => sum + d.total, 0);
    const rate = possible > 0 ? Math.round((completions / possible) * 100) : 0;

    return {
      totalCompletions: completions,
      avgRate: rate,
      dayStats: days,
    };
  }, [habits]);

  return (
    <View className="mb-4">
      {/* Stats row */}
      <View className="flex-row items-end justify-between mb-4">
        <View>
          <Text className="text-[24px] font-bold text-ink-primary">
            {totalCompletions}
          </Text>
          <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
            Done this week
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[24px] font-bold text-accent">
            {avgRate}%
          </Text>
          <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
            Avg rate
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View className="flex-row items-end justify-between h-[84px] px-1">
        {dayStats.map((day, index) => {
          const barHeight = Math.max(8, Math.round(day.rate * 64));
          const isHigh = day.rate >= 0.7;

          return (
            <View key={index} className="flex-1 items-center justify-end h-full">
              <View
                className={"w-6 rounded-t-sm " + (isHigh ? "bg-ink-primary" : "bg-background-surface2")}
                style={{ height: barHeight }}
              />
              <Text className="text-[10px] font-semibold text-ink-tertiary mt-2">
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="h-[1px] bg-border my-4" />
    </View>
  );
};

export default HabitMetrics;
