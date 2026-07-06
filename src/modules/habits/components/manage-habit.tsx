import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApLoader,
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import HabitCard from "./HabitCard";
import { toDateKey } from "@/src/utils/date";

const ManageHabitsScreen = () => {
  const { habits, loading, fetchHabits } = useHabitState();
  const colors = useTheme();
  const today = toDateKey(new Date());

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <ApLoader />;
  }

  const activeHabits = habits?.filter((h) => !h.isArchived) || [];
  const archivedHabits = habits?.filter((h) => h.isArchived) || [];

  return (
    <ApContainer>
      <ApHeader title="Manage Habits" hasBackButton />

      <ApScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-2 mt-4">
          <View className="flex-row justify-between items-center mb-6">
            <ApText size="2xl" font="bold" color={colors.textPrimary}>
              Your Routine
            </ApText>
            <ApText
              size="xs"
              font="bold"
              color={colors.textMuted}
              style={{ letterSpacing: 1 }}
            >
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
                selectedDate={today}
                variant="edit"
              />
            ))}
            {activeHabits.length === 0 && (
              <View
                className="rounded-2xl p-8 items-center border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <Ionicons
                  name="leaf-outline"
                  size={48}
                  color={colors.textMuted}
                />
                <ApText
                  size="base"
                  color={colors.textMuted}
                  className="mt-4 text-center"
                >
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
                style={{ letterSpacing: 1 }}
              >
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
                  selectedDate={today}
                  variant="restore"
                />
              ))}
            </View>
          </View>
        )}
      </ApScrollView>

      <View
        className="flex-row items-center justify-between px-5 py-6 border-t"
        style={{
          backgroundColor: colors.background,
          borderTopColor: colors.surfaceBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-2/5 h-12 border flex items-center justify-center rounded-full px-5 py-2"
          style={{ borderColor: colors.surfaceBorder }}
        >
          <ApText size="base" font="semibold" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/create-habit" as any)}
          className="w-2/5 h-12 flex items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <View className="flex-row items-center">
            <Ionicons name="add" size={20} color={colors.background} />
            <ApText
              size="sm"
              font="bold"
              color={colors.background}
              className="ml-1"
            >
              Add New
            </ApText>
          </View>
        </TouchableOpacity>
      </View>
    </ApContainer>
  );
};

export default ManageHabitsScreen;
