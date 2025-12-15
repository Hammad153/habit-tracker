import { View } from "react-native";
import HabitCard from "./components/HabitCard";
import { Ionicons } from "@expo/vector-icons";

import React from "react";

const Habits = () => {
  return (
    <View>
      <HabitCard
        title="Run 5km"
        description="Completed 7am"
        icon={<Ionicons name="analytics" size={24} color="black" />}
      />
      <HabitCard
        title="Morning Adhkar"
        description="15 mins remaining"
        icon={<Ionicons name="analytics" size={24} color="black" />}
      />
    </View>
  );
};

export default Habits;
