import React from "react";
import { View } from "react-native";
import { Award } from "lucide-react-native";
import { ApText } from "@/src/components/Text";
import { ProgressBar } from "@/src/components/ProgressBar";
import { useTheme } from "@/src/modules/settings/context";

interface LevelProgressProps {
  level: number;
  currentXp: number;
  neededXp: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  currentXp,
  neededXp,
}) => {
  const colors = useTheme();
  const progress = Math.min(1, Math.max(0, currentXp / (neededXp || 1)));

  return (
    <View
      className="p-5 rounded-2xl mb-4 mt-2"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center mb-4">
        {/* Large circle badge */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: colors.accentLight }}
        >
          <Award size={26} color={colors.primary} />
        </View>
        <View className="flex-1">
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="uppercase"
            style={{ letterSpacing: 0.8 }}
          >
            Current Rank
          </ApText>
          <ApText size="xl" font="semibold" color={colors.textPrimary}>
            Level {level}
          </ApText>
        </View>
        <ApText size="sm" font="medium" color={colors.textMuted}>
          {currentXp} / {neededXp} XP
        </ApText>
      </View>

      <ProgressBar progress={progress} height={8} />

      <ApText size="xs" color={colors.textMuted} className="mt-2.5">
        {Math.max(0, neededXp - currentXp)} XP needed to reach Level {level + 1}
      </ApText>
    </View>
  );
};

export default LevelProgress;
