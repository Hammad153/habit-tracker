import React from "react";
import { ScrollView, View, Text } from "react-native";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import { ApScrollView } from "@/components/ScrollView";
import Habits from "@/modules/habits/habits";
import MotivatingWords from "@/modules/home/motivationSection";
import ApContainer from "@/components/containers/container";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";

export default function HomeScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="px-4 py-6 space-y-6"
        >
          <View className="rounded-lg">
            <View className="w-full flex-row items-center justify-between pb-4 rounded-2xl">
              <View className="flex-row items-center flex-1">
                <View className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-primary/20">
                  <Image
                    source={{
                      uri: "../../assets/images/user_profile.png",
                    }}
                    className="w-full h-full rounded-full"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                    Good Morning
                  </Text>
                  <Text className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                    Ismail Hammad
                  </Text>
                </View>
              </View>

              <View className="flex items-center justify-center rounded-full size-10 bg-slate-200  text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-[#25382b]">
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#374151"
                />
              </View>
            </View>

            <View className="my-3">
              <MotivatingWords />
            </View>

            {/*Check completed goals*/}
            <View
              className={`flex flex-col gap-2 p-5 rounded-2xl bg-${ApTheme.Color.background} dark:bg-${ApTheme.Color.background} shadow-lg`}
            >
              <View className="flex flex-row gap-6 justify-between items-center">
                <Text className="text-slate-900 dark:text-white text-xl font-semibold">
                  Daily Goals
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  2/5 Completed
                </Text>
              </View>
              <View className="mt-2">
                <ProgressBar
                  progress={0.5}
                  color={ApTheme.Color.primary}
                  style={{ height: 8, borderRadius: 4 }}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-900 dark:text-white font-bold text-lg mb-4 mt-2">
                Your Habits
              </Text>
              <Habits />
            </View>
          </View>
        </ScrollView>
      </View>
    </ApContainer>
  );
}
