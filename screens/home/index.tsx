import React from "react";
import { View } from "react-native";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import { ApScrollView } from "@/components/ScrollView";
import Habits from "@/modules/habits/habits";
import MotivatingWords from "@/modules/home/components/motivationSection";
import DailyGoalsCard from "@/modules/home/components/DailyGoalsCard";
import UserGreeting from "@/modules/home/components/UserGreeting";
import ApContainer from "@/components/containers/container";

export default function HomeScreen() {
  return (
    <ApContainer className="h-screen">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <UserGreeting userName="Ismail Hammad" />

        <MotivatingWords />

        <DailyGoalsCard completed={5} total={5} />

        <View className="mt-4">
          <ApText size="xl" font="bold" color={ApTheme.Color.white}>
            Your Routine
          </ApText>
          <Habits />
        </View>
      </ApScrollView>
    </ApContainer>
  );
}
