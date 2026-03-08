import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";
import { router } from "expo-router";
import { ApLoader, ApScrollView, ApText, ApContainer } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const colors = useTheme();
  const { habits, loading: loadingHabits, fetchHabits } = useHabitState();
  const { profile, loading: loadingProfile, fetchProfile } = useProfileState();

  useEffect(() => {
    fetchHabits();
    fetchProfile();
  }, []);

  if (loadingHabits || loadingProfile) {
    return <ApLoader />;
  }

  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <ApContainer>
      <ApScrollView showsVerticalScrollIndicator={false}>
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
            habits?.filter((h: any) =>
              h.completions?.some((c: any) => c.date === dateStr && c.status),
            ).length || 0
          }
          total={habits?.length || 0}
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
            {habits?.map((habit) => (
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
            ))}
          </View>
        </View>
      </ApScrollView>

      <FAB
        icon="plus"
        onPress={() => router.push("/create-habit")}
        color={colors.background}
        style={{
          position: "absolute",
          bottom: 32,
          right: 20,
          backgroundColor: colors.primary,
          borderRadius: 28,
        }}
      />
    </ApContainer>
  );
};

export default HomeScreen;
