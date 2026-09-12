import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { router } from "expo-router";
import {
  ApHeader,
  ApEmptyState,
  SkeletonHabitList,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import HabitCard from "./HabitCard";
import { toDateKey } from "@/src/utils/date";

export const ManageHabitsScreen = () => {
  const { habits, loading, fetchHabits } = useHabitState();
  const colors = useTheme();
  const today = toDateKey(new Date());

  useEffect(() => {
    fetchHabits();
  }, []);

  const activeHabits = habits?.filter((h) => !h.isArchived) || [];
  const archivedHabits = habits?.filter((h) => h.isArchived) || [];

  return (
    <View className="flex-1 bg-background">
      <ApHeader title="Manage habits" hasBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {loading && habits.length === 0 ? (
          <SkeletonHabitList count={4} />
        ) : (
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-[12px] font-semibold text-ink-tertiary">
                Active habits ({activeHabits.length})
              </Text>
            </View>

            {activeHabits.length === 0 ? (
              <ApEmptyState
                title="No active habits"
                description="Create your first habit to manage it here."
                actionLabel="Create habit"
                onAction={() => router.push("/create-habit")}
              />
        ) : (
          <View className="bg-background-surface rounded-lg px-4 py-1 mb-6">
            {activeHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                icon={habit.icon}
                iconColor={habit.iconColor}
                iconBg={habit.iconBg}
                selectedDate={today}
                variant="edit"
                isLast={index === activeHabits.length - 1}
              />
            ))}
          </View>
        )}

        {archivedHabits.length > 0 && (
          <>
            <Text className="text-[12px] font-semibold text-ink-tertiary mb-3">
              Archived ({archivedHabits.length})
            </Text>
            <View className="bg-background-surface rounded-lg px-4 py-1">
              {archivedHabits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  subtitle={habit.subtitle}
                  icon={habit.icon}
                  iconColor={habit.iconColor}
                  iconBg={habit.iconBg}
                  selectedDate={today}
                  variant="restore"
                  isLast={index === archivedHabits.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </>
    )}
  </ScrollView>
    </View>
  );
};

export default ManageHabitsScreen;
