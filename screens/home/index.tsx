import React from "react";
import { View } from "react-native";
import { ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import { ApScrollView } from "@/components/ScrollView";
import Habits from "@/modules/habits/habits";
import MotivatingWords from "@/modules/home/motivationSection";

export default function HomeScreen() {
  return (
    <View className="h-screen">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className=" w-full flex-row items-center p-4 rounded-lg">
          <View className="">
            <View className="m-auto">
              <Ionicons name="person" size={24} color="black" />
            </View>
          </View>
          <View className="ml-4">
            <ApText size="xl" font="bold">
              Good Morning
            </ApText>
            <ApText color={ApTheme.Color.textSecondary}>Ismail Hammad</ApText>
          </View>
          <View className="flex flex-row justify-end w-[10%] ml-auto">
            <Ionicons name="notifications" size={24} color="black" />
          </View>
        </View>

        <View>
          <MotivatingWords />
        </View>

        {/*Check completed goals*/}
        <View className="bg-green-900 rounded-md p-4">
          <View className="flex flex-row items-center justify-between">
            <ApText size="2xl" font="bold" color={ApTheme.Color.primary}>
              Daily Goals
            </ApText>
            <ApText color={ApTheme.Color.white}>2/5 Completed</ApText>
          </View>
          <View className="mt-2">
            <ProgressBar
              progress={0.5}
              color={ApTheme.Color.progress}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>
        </View>

        <View className="mt-4">
          <ApText>Your Habits</ApText>
          <Habits />
        </View>
      </ApScrollView>
    </View>
  );
}
