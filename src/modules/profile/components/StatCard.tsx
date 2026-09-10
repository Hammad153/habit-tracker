import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  const colors = useTheme();

  return (
    <View
      className="flex-1 m-1.5 p-4 rounded-2xl items-center justify-center"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
        borderWidth: 1,
        minHeight: 88,
      }}>
      <ApText
        size="2xl"
        font="extrabold"
        color={colors.primary}
        className="mb-1">
        {value}
      </ApText>
      <ApText size="xs" color={colors.textMuted} textAlign="center" font="medium">
        {label}
      </ApText>
    </View>
  );
};

export default StatCard;
