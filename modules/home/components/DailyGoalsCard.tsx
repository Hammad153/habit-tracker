import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

interface DailyGoalsCardProps {
  completed: number;
  total: number;
}

const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View
      className="rounded-xl p-4"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderWidth: 1,
        borderColor: ApTheme.Color.surfaceBorder,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <ApText size="base" font="semibold" color={ApTheme.Color.textPrimary}>
          Daily Goal
        </ApText>
        <ApText size="sm" font="medium" color={ApTheme.Color.textSecondary}>
          {completed}/{total} Completed
        </ApText>
      </View>

      <View
        className="h-3 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: ApTheme.Color.progressBg }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: ApTheme.Color.primary,
            shadowColor: ApTheme.Color.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
          }}
        />
      </View>
    </View>
  );
};

export default DailyGoalsCard;
