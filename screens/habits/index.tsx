import React from "react";
import { ScrollView, View, Text } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import Habits from "@/modules/habits/habits";
import ApContainer from "@/components/containers/container";
import ApHeader from "@/components/Header";

export default function HabitScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        {/*<ApHeader title="Habits" hasBackButton />*/}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className=" px-4 py-6 space-y-6"
        >
          <View className="rounded-lg px-4 pb-4">
            <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4 mt-2">
              Your Habits
            </Text>
          </View>

          <View>
            <Habits />
          </View>
        </ScrollView>
      </View>
    </ApContainer>
  );
}
