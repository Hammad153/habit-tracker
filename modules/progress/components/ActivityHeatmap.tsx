import React from "react";
import { Completion } from "@/src/types";
import { subDays, format, isSameDay } from "date-fns";
import { View } from "react-native";
import { ApTheme } from "@/src/components/theme";

interface ActivityHeatmapProps {
  completions: Completion[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ completions }) => {
  const days = 7;
  const weeks = 12;

  const renderGrid = () => {
    const today = new Date();

    return Array.from({ length: weeks }).map((_, weekIndex) => (
      <View key={weekIndex} className="flex-col gap-2">
        {Array.from({ length: days }).map((_, dayIndex) => {
          // Calculate reverse date from today
          const date = subDays(
            today,
            (weeks - 1 - weekIndex) * 7 + (days - 1 - dayIndex),
          );

          const completionCount = completions.filter(
            (c) => isSameDay(new Date(c.date), date) && c.status,
          ).length;

          let color = ApTheme.Color.surfaceInactive;
          if (completionCount >= 3) color = ApTheme.Color.primary;
          else if (completionCount === 2) color = "rgba(19, 236, 91, 0.6)";
          else if (completionCount === 1) color = "rgba(19, 236, 91, 0.3)";

          return (
            <View
              key={`${weekIndex}-${dayIndex}`}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </View>
    ));
  };

  return (
    <View
      className="p-6 rounded-2xl items-center justify-center w-full mb-4"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
      }}>
      <View className="flex-row gap-2">{renderGrid()}</View>
    </View>
  );
};

export default ActivityHeatmap;
