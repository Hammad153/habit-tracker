import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/context/SettingsContext";

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
  const progress = (currentXp / neededXp) * 100;

  return (
    <View
      className="p-6 m-4 rounded-3xl"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
        borderWidth: 1,
      }}>
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <ApText size="sm" color={colors.primary} font="bold">
            CURRENT LEVEL
          </ApText>
          <ApText size="3xl" font="bold" color={colors.textPrimary}>
            Level {level}
          </ApText>
        </View>
        <ApText size="lg" font="bold" color={colors.textMuted}>
          {currentXp}/{neededXp} XP
        </ApText>
      </View>

      <View
        className="h-3 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: colors.background }}>
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      <ApText size="xs" color={colors.textMuted} className="mt-3">
        {neededXp - currentXp} XP needed to reach Level {level + 1}
      </ApText>
    </View>
  );
};

export default LevelProgress;
