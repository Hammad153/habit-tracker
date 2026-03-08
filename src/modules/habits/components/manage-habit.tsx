import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "react-native-paper";
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

const ManageHabitsScreen = () => {
  const { habits, loading, fetchHabits } = useHabitState();
  const colors = useTheme();

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
                selectedDate={new Date().toISOString().split("T")[0]}
                variant="edit"
              />
            ))}
            {activeHabits.length === 0 && (
              <View
                className="bg-surface rounded-2xl p-8 items-center border"
                style={{ borderColor: colors.surfaceBorder }}
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
                  selectedDate={new Date().toISOString().split("T")[0]}
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
          borderTopColor: colors.surfaceBorder,
          backgroundColor: colors.background,
        }}
      >
        <Button
          mode="outlined"
          onPress={() => router.back()}
          textColor={colors.textMuted}
          style={{
            flex: 1,
            marginRight: 8,
            borderColor: colors.surfaceBorder,
            borderRadius: 24,
          }}
        >
          Cancel
        </Button>

        <Button
          mode="contained"
          onPress={() => router.push("/create-habit" as any)}
          buttonColor={colors.primary}
          textColor={colors.background}
          icon="plus"
          labelStyle={{ fontWeight: "bold" }}
          style={{ flex: 1, marginLeft: 8, borderRadius: 24 }}
        >
          Add New
        </Button>
      </View>
    </ApContainer>
  );
};

export default ManageHabitsScreen;
