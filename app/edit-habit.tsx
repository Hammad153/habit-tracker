import React from "react";
import { useLocalSearchParams } from "expo-router";
import HabitForm from "@/src/modules/habits/components/habit-form";

const EditHabitRoute = () => {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  return <HabitForm habitId={habitId} />;
};

export default EditHabitRoute;
