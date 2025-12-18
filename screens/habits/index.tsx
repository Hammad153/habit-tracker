import React from "react";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import Habits from "@/modules/habits/habits";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";

export default function HabitScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader title="Habits" />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <Habits />
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
