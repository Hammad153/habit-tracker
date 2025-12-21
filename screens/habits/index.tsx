import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ApScrollView } from "@/components/ScrollView";
import Habits from "@/modules/habits/habits";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

export default function HabitScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader
          title="Habits"
          right={
            <TouchableOpacity onPress={() => router.push("/manage-habits")}>
              <ApText color={ApTheme.Color.primary} font="bold">
                Manage
              </ApText>
            </TouchableOpacity>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <Habits />
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
