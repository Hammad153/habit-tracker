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
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push("/create-habit")}>
                <View className="flex-row items-center gap-2 bg-primary/10 p-2 rounded-full">
                  <Ionicons
                    name="add"
                    size={20}
                    color={ApTheme.Color.primary}
                  />
                  <ApText color={ApTheme.Color.primary} font="bold">
                    Add
                  </ApText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/manage-habits")}>
                <View className="flex-row items-center gap-2 bg-primary/10 p-2 rounded-full">
                  <Ionicons
                    name="settings"
                    size={20}
                    color={ApTheme.Color.primary}
                  />
                  <ApText color={ApTheme.Color.primary} font="bold">
                    Manage
                  </ApText>
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
