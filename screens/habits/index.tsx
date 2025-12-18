import React from "react";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import Habits from "@/modules/habits/habits";

export default function HabitScreen() {
  return (
    <View className="h-screen">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <ApText size="2xl" font="bold" color={ApTheme.Color.primary}>
          Your Habits
        </ApText>

        <View>
          <Habits />
        </View>
      </ApScrollView>
    </View>
  );
}
