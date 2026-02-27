import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApScrollView } from "@/src/components/ScrollView";
import Habits from "@/modules/habits/habits";
import ApContainer from "@/src/components/containers/container";
import { ApHeader } from "@/src/components/Header";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

export default function HabitScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader
          title="Habits"
          right={
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.push("/create-habit")}>
                <View className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons
                    name="add"
                    size={24}
                    color={ApTheme.Color.primary}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/manage-habits")}>
                <View className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={ApTheme.Color.primary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <Habits />
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
