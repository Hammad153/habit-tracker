import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "../../components/Text";
import { ApTheme } from "../../components/theme";
import HabitCard from "@/modules/habits/components/HabitCard";
import { ACTIVE_HABITS, ARCHIVED_HABITS } from "./habitsStatusData";

export default function ManageHabitsScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ApTheme.Color.background }}
    >
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ApText size="base" color={ApTheme.Color.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>
        <ApText size="xl" font="bold" color="white">
          Manage Habits
        </ApText>
        <TouchableOpacity onPress={() => router.back()}>
          <ApText size="base" font="bold" color={ApTheme.Color.primary}>
            Done
          </ApText>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <ApText size="2xl" font="bold" color="white">
              Your Routine
            </ApText>
            <ApText
              size="xs"
              font="bold"
              color={ApTheme.Color.textMuted}
              style={{ letterSpacing: 1 }}
            >
              {ACTIVE_HABITS.length} ACTIVE
            </ApText>
          </View>

          <View className="space-y-3">
            {ACTIVE_HABITS.map((habit) => (
              <HabitCard
                id={habit.id}
                key={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                icon={habit.icon}
                iconColor={habit.iconColor}
                iconBg={habit.iconBg}
                variant="edit"
              />
            ))}
          </View>
        </View>

        <View className="px-5 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <ApText size="xl" font="bold" color={ApTheme.Color.textMuted}>
              Archived
            </ApText>
            <ApText
              size="xs"
              font="bold"
              color={ApTheme.Color.textMuted}
              style={{ letterSpacing: 1 }}
            >
              HIDDEN
            </ApText>
          </View>

          <View className="space-y-3">
            {ARCHIVED_HABITS.map((habit) => (
              <HabitCard
                id={habit.id}
                key={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                icon={habit.icon}
                iconColor={habit.iconColor}
                iconBg={habit.iconBg}
                variant="restore"
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-10 left-5 right-5">
        <TouchableOpacity
          onPress={() => router.push("/create-habit" as any)}
          className="w-full py-4 rounded-2xl items-center flex-row justify-center space-x-2 shadow-lg"
          style={{
            backgroundColor: ApTheme.Color.primary,
            shadowColor: ApTheme.Color.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <Ionicons name="add" size={24} color="#000" />
          <ApText size="lg" font="bold" color="#000">
            Add New Habit
          </ApText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
