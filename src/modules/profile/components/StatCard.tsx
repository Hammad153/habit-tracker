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
    <View className="items-center flex-1">
      <ApText
        size="3xl"
        font="semibold"
        color={colors.textPrimary}
        style={{ letterSpacing: -0.5 }}
      >
        {value}
      </ApText>
      <ApText
        size="xs"
        font="medium"
        color={colors.textMuted}
        className="uppercase mt-1"
        style={{ letterSpacing: 0.8 }}
      >
        {label}
      </ApText>
    </View>
  );
};

export default StatCard;
