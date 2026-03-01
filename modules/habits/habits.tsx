import { View, ActivityIndicator } from "react-native";
import HabitCard from "./components/HabitCard";
import React from "react";
import { useHabits } from "@/hooks/useHabits";
import { useSettings } from "@/src/context/SettingsContext";

const Habits = () => {
  const { data: habits, isLoading, refetch } = useHabits();
  const { colors } = useSettings();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} />;
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <View>
      {habits?.map((habit) => (
        <HabitCard
          key={habit.id}
          id={habit.id}
          title={habit.title}
          subtitle={habit.subtitle}
          icon={habit.icon}
          iconColor={habit.iconColor}
          iconBg={habit.iconBg}
          isCompleted={habit.completions?.some((c: any) => c.date === today)}
          selectedDate={today}
          variant="toggle"
          onRefresh={refetch}
        />
      ))}
    </View>
  );
};

export default Habits;
