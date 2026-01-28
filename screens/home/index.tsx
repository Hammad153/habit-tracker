import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import { ApScrollView } from "@/components/ScrollView";
import DateProgressSection from "@/modules/home/components/DateProgressSection";
import DailyGoalsCard from "@/modules/home/components/DailyGoalsCard";
import UserGreeting from "@/modules/home/components/UserGreeting";
import ApContainer from "@/components/containers/container";
import HabitCard from "@/modules/habits/components/HabitCard";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";

const Home: React.FC = () => {
  const {
    data: habits,
    isLoading: loadingHabits,
    refetch: refetchHabits,
  } = useHabits();
  const { data: profile, isLoading: loadingProfile } = useProfile();

  if (loadingHabits || loadingProfile) {
    return (
      <ApContainer className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator color={ApTheme.Color.primary} />
      </ApContainer>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <ApContainer className="h-screen bg-background relative">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <UserGreeting userName={profile?.name || "User"} />

        <DateProgressSection percentage={profile?.completionRate || 0} />

        <DailyGoalsCard
          completed={
            habits?.filter((h: any) =>
              h.completions?.some((c: any) => c.date === today),
            ).length || 0
          }
          total={habits?.length || 0}
        />

        <View className="mt-6 mb-20">
          <ApText
            size="xl"
            font="bold"
            color={ApTheme.Color.white}
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
                  (c: any) => c.date === today,
                )}
                onRefresh={refetchHabits}
              />
            ))}
          </View>
        </View>
      </ApScrollView>

      <TouchableOpacity
        onPress={() => router.push("/manage-habits")}
        className="absolute bottom-10 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
        style={{
          backgroundColor: ApTheme.Color.primary,
          shadowColor: ApTheme.Color.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </ApContainer>
  );
};

export default Home;
