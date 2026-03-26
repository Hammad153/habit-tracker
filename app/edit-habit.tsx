import React from "react";
import { useLocalSearchParams } from "expo-router";
import EditHabitScreen from "@/src/modules/habits/components/edit-habit";

const EditHabitRoute = () => {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  return <EditHabitScreen habitId={habitId!} />;
};

export default EditHabitRoute;
