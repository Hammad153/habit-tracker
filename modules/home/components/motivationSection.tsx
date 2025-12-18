import React from "react";
import { View } from "react-native";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import { formatDate } from "@/utils/date";
import ProgressCircle from "./ProgressCircle";

interface Props {
  completionPercentage?: number;
  motivationalMessage?: string;
}

const MotivatingWords: React.FC<Props> = ({
  completionPercentage = 40,
  motivationalMessage = "Keep up the good work!",
}) => {
  const { dayName, month, day } = formatDate(new Date());

  return (
    <View className="my-2 px-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <ApText size="2xl">
            <ApText size="2xl" color={ApTheme.Color.white} font="extrabold">
              {dayName},{" "}
            </ApText>
            <ApText size="2xl" font="bold" color={ApTheme.Color.primary}>
              {month} {day}
            </ApText>
          </ApText>

          <ApText
            size="base"
            color={ApTheme.Color.textSecondary}
            className="mt-1"
          >
            {motivationalMessage}
          </ApText>
        </View>

        <ProgressCircle percentage={completionPercentage} size={52} />
      </View>
    </View>
  );
};

export default MotivatingWords;
