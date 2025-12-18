import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import ToggleButton from "@/components/buttons/SwitchButton";

interface HabitCardProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

const HabitCard: React.FC<HabitCardProps> = ({ icon, title, description }) => {
  const [isDone, setIsDone] = useState(false);

  const toggleHabit = () => setIsDone((prev) => !prev);

  return (
    <Pressable onPress={toggleHabit}>
      <View className=" w-full flex-row items-center p-4 bg-white rounded-lg shadow-md my-1">
        <View className="relative text-2xl filter drop-shadow-[0_0_5px_rgba(19,236,91,0.5)] size-12 bg-green-100 rounded-full flex items-center justify-center">
          <View className="m-auto">{icon}</View>
        </View>
        <View className="ml-4">
          <Text className="text-slate-900 text-base font-semibold truncate leading-tight">
            {title}
          </Text>
          <Text className="text-primary text-xs font-medium mt-0.5">
            {description}
          </Text>
        </View>

        <View className="ml-auto">
          <ToggleButton isEnabled={isDone} onToggle={toggleHabit} />
        </View>
      </View>
    </Pressable>
  );
};

export default HabitCard;
