import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

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
  const progress = (currentXp / neededXp) * 100;

  return (
    <View
      className="p-6 m-4 rounded-3xl"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <ApText size="sm" color={ApTheme.Color.primary} font="bold">
            CURRENT LEVEL
          </ApText>
          <ApText size="3xl" font="bold" color="white">
            Level {level}
          </ApText>
        </View>
        <ApText size="lg" font="bold" color={ApTheme.Color.textMuted}>
          {currentXp}/{neededXp} XP
        </ApText>
      </View>

      <View
        className="h-3 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: ApTheme.Color.background }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: ApTheme.Color.primary,
          }}
        />
      </View>

      <ApText size="xs" color={ApTheme.Color.textMuted} className="mt-3">
        {neededXp - currentXp} XP needed to reach Level {level + 1}
      </ApText>
    </View>
  );
};

export default LevelProgress;
