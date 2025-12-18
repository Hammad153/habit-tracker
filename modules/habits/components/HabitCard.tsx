import React from "react";
import { View } from "react-native";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import ToggleButton from "@/components/buttons/SwitchButton";

interface HabitCardProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  progress?: number;
}

const HabitCard: React.FC<HabitCardProps> = ({ icon, title, description }) => {
  return (
    <View className=" w-full flex-row items-center p-4 bg-white rounded-lg shadow-md my-1">
      <View className="w-10 h-10 bg-gray-500 rounded-md">
        <View className="m-auto">{icon}</View>
      </View>
      <View className="ml-4">
        <ApText size="xl" font="bold">
          {title}
        </ApText>
        <ApText color={ApTheme.Color.textSecondary}>{description}</ApText>
      </View>
      <View className="flex flex-row justify-end w-[10%] ml-auto">
        <ToggleButton />
      </View>
    </View>
  );
};

export default HabitCard;
