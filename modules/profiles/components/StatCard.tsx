import React from "react";
import { View } from "react-native";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <View
      className="flex-1 m-1 p-3 rounded-2xl items-center justify-center"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
        minHeight: 80,
      }}
    >
      <ApText size="xl" font="bold" color="white" className="mb-0.5">
        {value}
      </ApText>
      <ApText size="xs" color={ApTheme.Color.textMuted} textAlign="center">
        {label}
      </ApText>
    </View>
  );
};

export default StatCard;
