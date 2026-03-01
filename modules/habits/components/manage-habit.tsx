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
import { useTheme } from "@/src/context/SettingsContext";

export default function ManageHabitsScreen() {
  const { data: habits, isLoading } = useHabits();
  const colors = useTheme();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={colors.primary} />
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
        backgroundColor: colors.background,
      }}>
      {/* Centered Header */}
      <View className="flex-row items-center justify-center px-5 py-4">
        <ApText size="lg" font="bold" color={colors.textPrimary}>
          Manage Habits
        </ApText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center mb-6">
            <ApText size="2xl" font="bold" color={colors.textPrimary}>
              Your Routine
            </ApText>
            <ApText
              size="xs"
              font="bold"
              color={colors.textMuted}
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
                selectedDate={new Date().toISOString().split("T")[0]}
                variant="edit"
              />
            ))}
            {activeHabits.length === 0 && (
              <View
                className="bg-surface rounded-2xl p-8 items-center border"
                style={{ borderColor: colors.surfaceBorder }}>
                <Ionicons
                  name="leaf-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <ApText
                  size="base"
                  color={colors.textMuted}
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
              <ApText size="xl" font="bold" color={colors.textMuted}>
                Archived
              </ApText>
              <ApText
                size="xs"
                font="bold"
                color={colors.textMuted}
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
                  selectedDate={new Date().toISOString().split("T")[0]}
                  variant="restore"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Consistent Bottom Navigation */}
      <View
        className="flex-row items-center justify-between px-5 py-6 bg-background border-t"
        style={{ borderTopColor: colors.surfaceBorder }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-2/5 h-12 border flex items-center justify-center rounded-full px-5 py-2"
          style={{ borderColor: colors.surfaceBorder }}>
          <ApText size="base" font="semibold" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/create-habit" as any)}
          className="w-2/5 h-12 flex items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary }}>
          <View className="flex-row items-center">
            <Ionicons name="add" size={20} color={colors.background} />
            <ApText
              size="sm"
              font="bold"
              color={colors.background}
              className="ml-1">
              Add New
            </ApText>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
