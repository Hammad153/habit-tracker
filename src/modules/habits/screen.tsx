import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApScrollView,
  ApLoader,
  ApContainer,
  ApHeader,
  ApEmptyState,
  ApErrorState,
  ApText,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "./context";
import HabitCard from "./components/HabitCard";
import { isSameDateKey, toDateKey } from "@/src/utils/date";

const HabitPageScreen = () => {
  const { colors } = useSettingsState();
  const { loading, error, habits, fetchHabits } = useHabitState();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const today = toDateKey(new Date());

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHabits().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const activeHabits = useMemo(() => {
    return habits.filter((h: any) => !h.isArchived);
  }, [habits]);

  const filteredHabits = useMemo(() => {
    return activeHabits.filter((h: any) => {
      const isDone = h.completions?.some(
        (c: any) => isSameDateKey(c.date, today) && c.status,
      );
      if (filter === "todo") return !isDone;
      if (filter === "done") return isDone;
      return true;
    });
  }, [activeHabits, filter, today]);

  if (loading && !refreshing) {
    return <ApLoader />;
  }

  return (
    <ApContainer>
      <View className="flex-1">
        <ApHeader
          title="Habits"
          right={
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.push("/create-habit")}>
                <View
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + "18" }}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/manage-habits")}>
                <View
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary + "18" }}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Filter Pills */}
        {activeHabits.length > 0 && (
          <View className="flex-row px-4 mb-3 space-x-2">
            {[
              { id: "all", label: `All (${activeHabits.length})` },
              {
                id: "todo",
                label: `To Do (${
                  activeHabits.filter(
                    (h: any) =>
                      !h.completions?.some(
                        (c: any) => isSameDateKey(c.date, today) && c.status,
                      ),
                  ).length
                })`,
              },
              {
                id: "done",
                label: `Done (${
                  activeHabits.filter((h: any) =>
                    h.completions?.some(
                      (c: any) => isSameDateKey(c.date, today) && c.status,
                    ),
                  ).length
                })`,
              },
            ].map((tab) => {
              const active = filter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setFilter(tab.id as any)}
                  className="px-3.5 py-1.5 rounded-full mr-2 border"
                  style={{
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.surfaceBorder,
                  }}
                >
                  <ApText
                    size="xs"
                    font="bold"
                    color={active ? colors.background : colors.textSecondary}
                  >
                    {tab.label}
                  </ApText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <ApScrollView
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        >
          <View className="px-2 pb-12">
            {error && habits.length === 0 ? (
              <ApErrorState onRetry={handleRefresh} />
            ) : filteredHabits.length > 0 ? (
              filteredHabits.map((habit: any) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  subtitle={habit.subtitle}
                  icon={habit.icon}
                  iconColor={habit.iconColor}
                  iconBg={habit.iconBg}
                  isCompleted={habit.completions?.some(
                    (c: any) => isSameDateKey(c.date, today) && c.status,
                  )}
                  selectedDate={today}
                  variant="toggle"
                  onRefresh={handleRefresh}
                  goal={habit.goal}
                  value={
                    habit.completions?.find((c: any) =>
                      isSameDateKey(c.date, today),
                    )?.value || 0
                  }
                  unit={habit.unit}
                  fullBehavior={habit.fullBehavior}
                  minimumBehavior={habit.minimumBehavior}
                  emergencyMinimum={habit.emergencyMinimum}
                  stackAfterTitle={
                    habit.stackAfterHabitId
                      ? habits.find((h: any) => h.id === habit.stackAfterHabitId)
                          ?.title
                      : undefined
                  }
                />
              ))
            ) : (
              <ApEmptyState
                icon={filter === "done" ? "checkmark-circle-outline" : "leaf-outline"}
                title={
                  filter === "done"
                    ? "No completed habits yet today"
                    : filter === "todo"
                    ? "All caught up for today!"
                    : "No habits yet"
                }
                subtitle={
                  filter === "done"
                    ? "Check off habits as you complete them."
                    : filter === "todo"
                    ? "Great job completing your scheduled habits."
                    : "Create your first habit to start building your routine."
                }
                actionLabel={activeHabits.length === 0 ? "Create Habit" : undefined}
                onAction={
                  activeHabits.length === 0
                    ? () => router.push("/create-habit")
                    : undefined
                }
              />
            )}
          </View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
};

export default HabitPageScreen;
