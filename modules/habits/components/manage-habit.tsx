import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "../../../src/components/Text";
import HabitCard from "@/modules/habits/components/HabitCard";
import { useHabits } from "@/hooks/useHabits";
import { ApTheme } from "@/src/components/theme";

export default function ManageHabitsScreen() {
  const { data: habits, isLoading } = useHabits();

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: ApTheme.Color.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={ApTheme.Color.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const activeHabits = habits?.filter((h) => !h.isArchived) || [];
  const archivedHabits = habits?.filter((h) => h.isArchived) || [];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -60,
        backgroundColor: ApTheme.Color.background,
      }}>
      {/* Centered Header */}
      <View className="flex-row items-center justify-center px-5 py-4">
        <ApText size="lg" font="bold" color="white">
          Manage Habits
        </ApText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center mb-6">
            <ApText size="2xl" font="bold" color="white">
              Your Routine
            </ApText>
            <ApText
              size="xs"
              font="bold"
              color={ApTheme.Color.textMuted}
              style={{ letterSpacing: 1 }}>
              {activeHabits.length} ACTIVE
            </ApText>
          </View>

          <View className="space-y-4">
            {activeHabits.map((habit) => (
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
            {activeHabits.length === 0 && (
              <View className="bg-surface rounded-2xl p-8 items-center border border-white/5">
                <Ionicons
                  name="leaf-outline"
                  size={48}
                  color={ApTheme.Color.textMuted}
                />
                <ApText
                  size="base"
                  color={ApTheme.Color.textMuted}
                  className="mt-4 text-center">
                  No active habits yet. Start by adding one!
                </ApText>
              </View>
            )}
          </View>
        </View>

        {archivedHabits.length > 0 && (
          <View className="px-5 mt-10">
            <View className="flex-row justify-between items-center mb-6">
              <ApText size="xl" font="bold" color={ApTheme.Color.textMuted}>
                Archived
              </ApText>
              <ApText
                size="xs"
                font="bold"
                color={ApTheme.Color.textMuted}
                style={{ letterSpacing: 1 }}>
                {archivedHabits.length} HIDDEN
              </ApText>
            </View>

            <View className="space-y-4">
              {archivedHabits.map((habit) => (
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
        )}
      </ScrollView>

      {/* Consistent Bottom Navigation */}
      <View className="flex-row items-center justify-between px-5 py-6 bg-background border-t border-white/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-2/5 h-12 border flex items-center justify-center border-green-500/30 rounded-full px-5 py-2">
          <ApText size="base" font="semibold" color={ApTheme.Color.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/create-habit" as any)}
          className="w-2/5 h-12 flex items-center justify-center rounded-full bg-primary">
          <View className="flex-row items-center">
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <ApText size="sm" font="bold" color="#FFFFFF" className="ml-1">
              Add New
            </ApText>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
