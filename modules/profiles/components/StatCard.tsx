import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/context/SettingsContext";

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  const colors = useTheme();

  return (
    <View
      className="flex-1 m-1 p-3 rounded-2xl items-center justify-center"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
        borderWidth: 1,
        minHeight: 80,
      }}>
      <ApText
        size="xl"
        font="bold"
        color={colors.textPrimary}
        className="mb-0.5">
        {value}
      </ApText>
      <ApText size="xs" color={colors.textMuted} textAlign="center">
        {label}
      </ApText>
    </View>
  );
};

export default StatCard;
