import React from "react";
import { View, ScrollView, Text } from "react-native";
import { ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { ApTheme } from "@/components/theme";
import Habits from "@/modules/habits/habits";
import MotivatingWords from "@/modules/home/motivationSection";

export default function HomeScreen() {
  return (
    <View className="h-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4 py-6 space-y-6"
      >
        <View className="rounded-lg px-4 pb-4">
          <View className=" w-full flex-row items-center p-4 rounded-lg">
            <View className="">
              <View className="m-auto">
                <Ionicons name="person" size={24} color="black" />
              </View>
            </View>
            <View className="ml-4">
              <Text className="text-xl font-bold">{"Good Morning"}</Text>
              <Text className="text-gray-500">{"Ismail Hammad"}</Text>
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
              <Text className="text-3xl font-bold pt-4 text-primary">
                Daily Goals
              </Text>
              <Text className="text-white">2/5 Completed</Text>
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
            <Text>Your Habits</Text>
            <Habits />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
