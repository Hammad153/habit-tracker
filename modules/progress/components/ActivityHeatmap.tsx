import React from "react";
import { View } from "react-native";
import { ApTheme } from "@/src/components/theme";

const ActivityHeatmap = () => {
  const days = 7;
  const weeks = 12;

  const renderGrid = () => {
    return Array.from({ length: weeks }).map((_, weekIndex) => (
      <View key={weekIndex} className="flex-col gap-2">
        {Array.from({ length: days }).map((_, dayIndex) => {
          const random = Math.random();
          let color = ApTheme.Color.surfaceInactive;
          if (random > 0.7) color = ApTheme.Color.primary;
          else if (random > 0.4) color = "rgba(19, 236, 91, 0.4)";
          else if (random > 0.2) color = "rgba(19, 236, 91, 0.2)";

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
      }}
    >
      <View className="flex-row gap-2">{renderGrid()}</View>
    </View>
  );
};

export default ActivityHeatmap;
