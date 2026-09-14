import React from "react";
import { View } from "react-native";
import { Completion } from "@/src/types";
import { subDays, isSameDay } from "date-fns";
import { useTheme } from "@/src/modules/settings/context";
import { ApText } from "@/src/components/Text";
import { ApCard } from "@/src/components/Card";

interface ActivityHeatmapProps {
  completions: Completion[];
}

const DAYS_HEADER = ["M", "T", "W", "T", "F", "S", "S"];

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ completions }) => {
  const colors = useTheme();
  const days = 7;
  const weeks = 12;

  const renderGrid = () => {
    const today = new Date();

    return Array.from({ length: weeks }).map((_, weekIndex) => (
      <View key={weekIndex} className="flex-col gap-1.5">
        {Array.from({ length: days }).map((_, dayIndex) => {
          const date = subDays(
            today,
            (weeks - 1 - weekIndex) * 7 + (days - 1 - dayIndex),
          );

          const completionCount = completions.filter(
            (c) => isSameDay(new Date(c.date), date) && c.status,
          ).length;

          let bg = colors.surfaceInactive;
          if (completionCount >= 3) {
            bg = colors.primary;
          } else if (completionCount === 2) {
            bg = colors.heatmapMid;
          } else if (completionCount === 1) {
            bg = colors.heatmapLight;
          }

          return (
            <View
              key={`${weekIndex}-${dayIndex}`}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: bg }}
            />
          );
        })}
      </View>
    ));
  };

  return (
    <ApCard className="p-4 w-full mb-4">
      <View className="flex-row justify-between mb-2 px-1">
        {DAYS_HEADER.map((d, i) => (
          <ApText key={i} size="xs" color={colors.textMuted} style={{ fontSize: 11 }}>
            {d}
          </ApText>
        ))}
      </View>
      <View className="flex-row gap-1.5 justify-center">{renderGrid()}</View>
      <View className="flex-row items-center justify-end mt-3 gap-1">
        <ApText size="xs" color={colors.textMuted} style={{ fontSize: 10 }}>
          Less
        </ApText>
        <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.surfaceInactive }} />
        <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.heatmapLight }} />
        <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.heatmapMid }} />
        <View className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary }} />
        <ApText size="xs" color={colors.textMuted} style={{ fontSize: 10 }}>
          More
        </ApText>
      </View>
    </ApCard>
  );
};

export default ActivityHeatmap;
