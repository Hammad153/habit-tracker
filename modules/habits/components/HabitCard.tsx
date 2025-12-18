import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
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
    <Pressable
      onPress={toggleHabit}
      className="w-full flex-row items-center p-3 rounded-xl border my-1.5"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
      }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{
          backgroundColor: isDone
            ? ApTheme.Color.primary + "25"
            : "transparent",
          borderWidth: isDone ? 0 : 2,
          borderColor: isDone ? "transparent" : ApTheme.Color.surfaceBorder,
        }}
      >
        {typeof icon === "string" ? <ApText size="xl">{icon}</ApText> : icon}
      </View>

      <View className="ml-3.5 flex-1">
        <ApText size="base" font="semibold" color={ApTheme.Color.white}>
          {title}
        </ApText>
        <ApText
          size="sm"
          className="mt-0.5"
          style={{
            color: isDone ? ApTheme.Color.primary : ApTheme.Color.textSecondary,
          }}
        >
          {description}
        </ApText>
      </View>

      <View className="ml-auto">
        <ToggleButton isEnabled={isDone} onToggle={toggleHabit} />
      </View>
    </Pressable>
  );
};

export default HabitCard;
