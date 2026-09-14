import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

interface OverviewStatsProps {
  streak: number;
  totalDone: number;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ streak, totalDone }) => {
  const colors = useTheme();

  return (
    <View className="flex-row items-center justify-around py-4 mb-6">
      <View className="items-center flex-1">
        <ApText
          size="3xl"
          font="semibold"
          color={colors.textPrimary}
          style={{ letterSpacing: -0.5 }}
        >
          {streak}
        </ApText>
        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="uppercase mt-1"
          style={{ letterSpacing: 0.8 }}
        >
          Current Streak
        </ApText>
      </View>

      <View
        className="w-[1px] h-8 self-center"
        style={{ backgroundColor: colors.surfaceBorder }}
      />

      <View className="items-center flex-1">
        <ApText
          size="3xl"
          font="semibold"
          color={colors.textPrimary}
          style={{ letterSpacing: -0.5 }}
        >
          {totalDone}
        </ApText>
        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="uppercase mt-1"
          style={{ letterSpacing: 0.8 }}
        >
          Total Logs
        </ApText>
      </View>
    </View>
  );
};

export default OverviewStats;
