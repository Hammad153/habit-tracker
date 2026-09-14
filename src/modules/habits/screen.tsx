import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { Plus, MoreHorizontal } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApEmptyState,
  ApErrorState,
  SkeletonHabitList,
} from "@/src/components";
import { Tag } from "@/src/components/Tag";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useHabitState } from "./context";
import HabitCard from "./components/HabitCard";
import HabitMetrics from "./components/HabitMetrics";
import { isSameDateKey, toDateKey } from "@/src/utils/date";

export const HabitPageScreen = () => {
  const colors = useTheme();
  const { user } = useAuthState();
  const { loading, error, habits, fetchHabits } = useHabitState();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const today = toDateKey(new Date());

  useEffect(() => {
    fetchHabits();
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHabits().finally(() => {
      setRefreshing(false);
    });
  }, [fetchHabits]);

  const activeHabits = useMemo(() => {
    return habits.filter((h: any) => !h.isArchived);
  }, [habits]);

  const todoCount = useMemo(() => {
    return activeHabits.filter(
      (h: any) => !h.completions?.some((c: any) => isSameDateKey(c.date, today) && c.status)
    ).length;
  }, [activeHabits, today]);

  const doneCount = activeHabits.length - todoCount;

  const filteredHabits = useMemo(() => {
    const list = activeHabits.filter((h: any) => {
      const isDone = h.completions?.some(
        (c: any) => isSameDateKey(c?.date, today) && c.status
      );
      if (filter === "todo") return !isDone;
      if (filter === "done") return isDone;
      return true;
    });

    return [...list].sort((a: any, b: any) => {
      const aDone = a.completions?.some((c: any) => isSameDateKey(c?.date, today) && c.status) ? 1 : 0;
      const bDone = b.completions?.some((c: any) => isSameDateKey(c?.date, today) && c.status) ? 1 : 0;
      return aDone - bDone;
    });
  }, [activeHabits, filter, today]);

  const isInitialLoading = loading && !refreshing && habits.length === 0;

  if (error && habits.length === 0 && !isInitialLoading) {
    return <ApErrorState onRetry={handleRefresh} />;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* Navbar */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <Text className="text-[22px] font-bold text-ink-primary">
            Habits
          </Text>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/create-habit")}
              className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Create habit"
            >
              <Plus size={20} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/manage-habits")}
              className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Manage habits"
            >
              <MoreHorizontal size={20} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Weekly Metrics and Bar chart */}
        <HabitMetrics habits={habits} />

        {/* Filter Tags */}
        <View className="flex-row gap-2 mb-4">
          <Tag
            label={"All · " + activeHabits.length}
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />
          <Tag
            label={"To do · " + todoCount}
            active={filter === "todo"}
            onPress={() => setFilter("todo")}
          />
          <Tag
            label={"Done · " + doneCount}
            active={filter === "done"}
            onPress={() => setFilter("done")}
          />
        </View>

        {/* Habit List */}
        {isInitialLoading ? (
          <SkeletonHabitList count={4} />
        ) : filteredHabits.length === 0 ? (
          <ApEmptyState
            title={activeHabits.length === 0 ? "No habits yet" : "No habits match filter"}
            description={
              activeHabits.length === 0
                ? "Start building your routine with your first habit."
                : "Try selecting a different filter above."
            }
            actionLabel={activeHabits.length === 0 ? "Create habit" : undefined}
            onAction={activeHabits.length === 0 ? () => router.push("/create-habit") : undefined}
          />
        ) : (
          <View className="bg-background-surface rounded-lg px-4 py-1">
            {filteredHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                subtitle={habit.subtitle}
                icon={habit.icon}
                iconColor={habit.iconColor}
                iconBg={habit.iconBg}
                selectedDate={today}
                isCompleted={habit.completions?.some(
                  (c: any) => isSameDateKey(c.date, today) && c.status
                )}
                goal={habit.goal}
                value={
                  habit.completions?.find((c: any) =>
                    isSameDateKey(c.date, today)
                  )?.value || 0
                }
                unit={habit.unit}
                fullBehavior={habit.fullBehavior}
                minimumBehavior={habit.minimumBehavior}
                emergencyMinimum={habit.emergencyMinimum}
                stackAfterTitle={
                  habit.stackAfterHabitId
                    ? habits.find((h: any) => h.id === habit.stackAfterHabitId)?.title
                    : undefined
                }
                isLast={index === filteredHabits.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HabitPageScreen;
