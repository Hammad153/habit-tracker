import { View } from "react-native";
import HabitCard from "./components/HabitCard";
import React, { useState, useEffect } from "react";
import { habitApi } from "@/libs/api";

const Habits = () => {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await habitApi.getAll();
      setHabits(res.data);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  return (
    <View>
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          id={habit.id}
          title={habit.title}
          subtitle={habit.subtitle}
          icon={habit.icon}
          iconColor={habit.iconColor}
          iconBg={habit.iconBg}
          isCompleted={habit.completions?.some((c: any) => c.date === today)}
          variant="toggle"
          onRefresh={fetchData}
        />
      ))}
    </View>
  );
};

export default Habits;
