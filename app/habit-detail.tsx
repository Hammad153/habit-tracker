import React from "react";
import { useLocalSearchParams } from "expo-router";
import HabitDetailScreen from "@/src/modules/habits/components/habit-detail";

const HabitDetailRoute = () => {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  return <HabitDetailScreen habitId={habitId!} />;
};

export default HabitDetailRoute;
