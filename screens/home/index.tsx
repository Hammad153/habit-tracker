import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApTheme } from "@/src/components/theme";
import { ApText } from "@/src/components/Text";
import { ApScrollView } from "@/src/components/ScrollView";
import HorizontalDatePicker from "@/modules/home/components/HorizontalDatePicker";
import DailyGoalsCard from "@/modules/home/components/DailyGoalsCard";
import UserGreeting from "@/modules/home/components/UserGreeting";
import ApContainer from "@/src/components/containers/container";
import HabitCard from "@/modules/habits/components/HabitCard";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
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

  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <ApContainer className="h-screen bg-background relative">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: ApTheme.Color.surfaceGlow,
            borderRadius: 20,
            paddingLeft: 20,
            paddingRight: 20,
          }}>
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
            color={ApTheme.Color.white}
            className="mb-2">
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
                onRefresh={refetchHabits}
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

      <TouchableOpacity
        onPress={() => router.push("/create-habit")}
        className="absolute bottom-10 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
        style={{
          backgroundColor: ApTheme.Color.primary,
          shadowColor: ApTheme.Color.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}>
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </ApContainer>
  );
};

export default Home;
