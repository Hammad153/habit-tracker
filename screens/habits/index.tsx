import React from "react";
import { View, ScrollView, Text } from "react-native";
import Habits from "@/modules/habits/habits";

export default function HabitScreen() {
  return (
    <View className="h-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className=" px-4 py-6 space-y-6"
      >
        <View className="rounded-lg px-4 pb-4">
          <Text className="text-3xl font-bold text-primary">Your Habits</Text>
        </View>

        <View>
          <Habits />
        </View>
      </ScrollView>
    </View>
  );
}
