import { View } from "react-native";
import HabitCard from "./components/HabitCard";
import { Ionicons } from "@expo/vector-icons";

import React from "react";

const Habits = () => {
  const habits = [
    {
      title: "Run 5km",
      description: "Completed 7am",
      icon: <Ionicons name="analytics" size={24} color="black" />,
    },
    {
      title: "Morning Adhkar",
      description: "15 mins remaining",
      icon: <Ionicons name="analytics" size={24} color="black" />,
    },
    {
      title: "Read 20 pages",
      description: "Completed 10 pages",
      icon: <Ionicons name="analytics" size={24} color="black" />,
    },
  ];
  return (
    <View>
      {habits.map((habit, index) => (
        <HabitCard
          key={index}
          title={habit.title}
          description={habit.description}
          icon={habit.icon}
        />
      ))}
    </View>
  );
};

export default Habits;
