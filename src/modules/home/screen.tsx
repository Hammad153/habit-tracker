import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApLoader,
  ApScrollView,
  ApText,
  ApContainer,
  ApEmptyState,
  ApErrorState,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { useAuthState } from "@/src/modules/auth/context";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";
import UpgradeModal from "@/src/modules/subscription/components/UpgradeModal";

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const colors = useTheme();
  const {
    habits,
    loading: loadingHabits,
    error: habitsError,
    fetchHabits,
  } = useHabitState();
  const { profile, loading: loadingProfile, fetchProfile } = useProfileState();
  const { fetchSubscription } = useSubscriptionState();
  const { user } = useAuthState();

  const loadAll = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return Promise.all([fetchHabits(), fetchProfile(), fetchSubscription()]);
  }, [user?.id]);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll().finally(() => setRefreshing(false));
  }, [loadAll]);

  const dateStr = selectedDate.toISOString().split("T")[0];

  // Filter habits by schedule for the selected date
  const scheduledHabits = useMemo(() => {
    if (!habits) return [];
    return habits.filter(
      (h) => !h.isArchived && isHabitScheduledForDate(h, selectedDate),
    );
  }, [habits, selectedDate]);

  if ((loadingHabits || loadingProfile) && !refreshing) {
    return <ApLoader />;
  }

  if (habitsError && habits.length === 0) {
    return (
      <ApContainer>
        <ApErrorState onRetry={handleRefresh} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApScrollView
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View
          style={{
            backgroundColor: colors.surfaceGlow,
            borderRadius: 20,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <UserGreeting userName={profile?.name || "User"} />
        </View>

        <HorizontalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <DailyGoalsCard
          completed={
            scheduledHabits.filter((h: any) =>
              h.completions?.some((c: any) => c.date === dateStr && c.status),
            ).length || 0
          }
          total={scheduledHabits.length}
        />

        <View className="mt-6 mb-20">
          <ApText
            size="xl"
            font="bold"
            color={colors.textPrimary}
            className="mb-2"
          >
            Your Habits
          </ApText>
          <View>
            {scheduledHabits.length === 0 ? (
              <ApEmptyState
                icon="calendar-outline"
                title="Nothing scheduled"
                subtitle={
                  habits.length === 0
                    ? "Add a habit to start your day."
                    : "No habits are scheduled for this day."
                }
                actionLabel={habits.length === 0 ? "Create Habit" : undefined}
                onAction={
                  habits.length === 0
                    ? () => router.push("/create-habit")
                    : undefined
                }
              />
            ) : (
              scheduledHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  subtitle={habit.subtitle}
                  icon={habit.icon}
                  iconColor={habit.iconColor}
                  iconBg={habit.iconBg}
                  isCompleted={habit.completions?.some(
                    (c: any) => c.date === dateStr && c.status,
                  )}
                  selectedDate={dateStr}
                  onRefresh={() => fetchHabits()}
                  goal={habit.goal}
                  value={
                    habit.completions?.find((c: any) => c.date === dateStr)
                      ?.value || 0
                  }
                />
              ))
            )}
          </View>
        </View>
      </ApScrollView>

      <TouchableOpacity
        onPress={() => router.push("/create-habit")}
        className="absolute bottom-8 right-5 w-16 h-16 rounded-full items-center justify-center z-50"
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      <UpgradeModal />
    </ApContainer>
  );
};

export default HomeScreen;
