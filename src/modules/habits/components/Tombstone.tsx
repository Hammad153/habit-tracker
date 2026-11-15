import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import { lifespanLabel } from "@/src/modules/habits/epitaph";
import { format } from "date-fns";

export interface TombstoneProps {
  burial: {
    id: string;
    title: string;
    habitCreatedAt: string;
    buriedAt: string;
    lastCompletedDay?: string | null;
    totalCompletions: number;
    bestStreak: number;
    reason?: string | null;
    epitaph: string;
    theme: string;
    restoredAt?: string | null;
    restartHabitId?: string | null;
  };
  onPress?: (burialId: string) => void;
}

const THEME_COLORS: Record<string, { bg: string; border: string }> = {
  stone: { bg: "#E8E4DF", border: "#C7C2B9" },
  slate: { bg: "#D8DCE0", border: "#B9C0C6" },
  midnight: { bg: "#D6DBDF", border: "#B0B7BC" },
};

export const Tombstone: React.FC<TombstoneProps> = ({
  burial,
  onPress,
}) => {
  const colors = useTheme();
  const theme = THEME_COLORS[burial.theme] ?? THEME_COLORS.stone;
  const created = new Date(burial.habitCreatedAt);
  const buried = new Date(burial.buriedAt);
  const lifespanDays = Math.max(
    1,
    Math.round((buried.getTime() - created.getTime()) / 86_400_000),
  );

  const handlePress = () => {
    if (onPress) onPress(burial.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-full rounded-2xl p-4 border active:opacity-90"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Tombstone for ${burial.title}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text
          className="text-[16px] font-bold"
          style={{ color: colors.inkPrimary }}
          numberOfLines={2}
        >
          RIP — {burial.title}
        </Text>
        <Text
          className="text-[11px] font-medium"
          style={{ color: colors.inkTertiary }}
        >
          {format(buried, "MMM d")}
        </Text>
      </View>
      <Text
        className="text-[13px] font-medium mb-2"
        style={{ color: colors.inkSecondary }}
      >
        Lived: {lifespanLabel(lifespanDays)}
      </Text>
      <Text
        className="text-[13px] leading-[18px]"
        style={{ color: colors.inkPrimary }}
        numberOfLines={3}
      >
        {burial.epitaph}
      </Text>
      {burial.reason && (
        <View className="mt-2 pt-2 border-t border-border">
          <Text className="text-[11px] font-medium" style={{ color: colors.inkTertiary }}>
            Reason: {burial.reason}
          </Text>
        </View>
      )}
      <View className="flex-row items-center justify-end mt-3">
        <Text className="text-[10px] font-semibold text-uppercase" style={{ color: colors.inkTertiary }}>
          View details
        </Text>
      </View>
    </Pressable>
  );
};

export default Tombstone;
