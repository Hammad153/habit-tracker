import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { ProgressBar } from "@/src/components/ProgressBar";
import { useTheme } from "@/src/modules/settings/context";
import { getHabitLucideIcon } from "@/src/utils/icons";
import { Completion } from "@/src/types";

interface HabitBreakdownCardProps {
  title: string;
  category: string;
  percentage: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  completions?: Completion[];
}

const HabitBreakdownCard: React.FC<HabitBreakdownCardProps> = ({
  title,
  category,
  percentage,
}) => {
  const colors = useTheme();
  const IconComponent = getHabitLucideIcon(title);

  return (
    <View
      className="p-3 mb-2 rounded-xl"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-3">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center mr-3"
            style={{ backgroundColor: colors.accentLight }}
          >
            <IconComponent size={16} color={colors.primary} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <ApText
              size="sm"
              font="medium"
              color={colors.textPrimary}
              numberOfLines={1}
            >
              {title}
            </ApText>
            <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
              {category}
            </ApText>
          </View>
        </View>
        <ApText size="sm" font="semibold" color={colors.textPrimary}>
          {percentage}%
        </ApText>
      </View>
      <ProgressBar progress={percentage / 100} height={4} />
    </View>
  );
};

export default HabitBreakdownCard;
