import { View } from "react-native";
import HabitCard from "./components/HabitCard";
import React from "react";
import { ACTIVE_HABITS } from "@/screens/manage-habits/habitsStatusData";

const Habits = () => {
  return (
    <View>
      {ACTIVE_HABITS.map((habit) => (
        <HabitCard
          key={habit.id}
          title={habit.title}
          subtitle={habit.subtitle}
          icon={habit.icon}
          iconColor={habit.iconColor}
          iconBg={habit.iconBg}
          variant="toggle"
        />
      ))}
    </View>
  );
};

export default Habits;
