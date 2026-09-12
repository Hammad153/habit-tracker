import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/src/components/Card";
import { ProgressRing } from "@/src/components/ProgressRing";

interface DailyGoalsCardProps {
  completed: number;
  total: number;
}

export const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  completed,
  total,
}) => {
  const rate = total > 0 ? completed / total : 0;
  const percentage = Math.round(rate * 100);

  const subText =
    completed === 0
      ? "Nothing logged yet — start with one."
      : completed >= total && total > 0
      ? "All done for today!"
      : `${total - completed} left to complete today.`;

  return (
    <Card className="flex-row items-center gap-4">
      <ProgressRing
        progress={rate}
        size={92}
        strokeWidth={8}
        centerText={`${percentage}%`}
        centerSubText="TODAY"
      />
      <View className="flex-1">
        <Text className="text-[17px] font-bold text-ink-primary">
          {completed} of {total} done
        </Text>
        <Text className="text-[12.5px] text-ink-secondary mt-1">
          {subText}
        </Text>
      </View>
    </Card>
  );
};

export default DailyGoalsCard;
