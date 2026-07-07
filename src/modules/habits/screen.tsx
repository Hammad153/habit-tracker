import React, { useCallback, useEffect, useState } from "react";
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
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "./context";
import HabitCard from "./components/HabitCard";
import { isSameDateKey, toDateKey } from "@/src/utils/date";

const HabitPageScreen = () => {
  const { colors } = useSettingsState();
  const { loading, error, habits, fetchHabits } = useHabitState();
  const [refreshing, setRefreshing] = useState(false);
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

  if (loading && !refreshing) {
    return <ApLoader />;
  }

  return (
    <ApContainer>
      <View className="flex-1">
        <ApHeader
          title="Habits"
          hasBackButton
          right={
            <View className="flex-row items-center gap-3">
              <TouchableOpacity onPress={() => router.push("/create-habit")}>
                <View className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/manage-habits")}>
                <View className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
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
        <ApScrollView
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        >
          <View>
            {error && habits.length === 0 ? (
              <ApErrorState onRetry={handleRefresh} />
            ) : habits.length > 0 ? (
              habits?.map((habit) => (
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
                />
              ))
            ) : (
              <ApEmptyState
                icon="leaf-outline"
                title="No habits yet"
                subtitle="Create your first habit to start building your routine."
                actionLabel="Create Habit"
                onAction={() => router.push("/create-habit")}
              />
            )}
          </View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
};

export default HabitPageScreen;
