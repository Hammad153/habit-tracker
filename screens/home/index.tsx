import React from "react";
import { View, TouchableOpacity } from "react-native";
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

const Home: React.FC = () => {
  return (
    <ApContainer className="h-screen bg-background relative">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <UserGreeting userName="Ismail Hammad" />

        <DateProgressSection percentage={40} />

        <DailyGoalsCard completed={2} total={5} />

        <View className="mt-6 mb-20">
          <ApText size="xl" font="bold" color={ApTheme.Color.white} className="mb-2">
            Your Habits
          </ApText>
           <View>
             <HabitCard
                title="Run 5km"
                description="Completed at 7:00 AM"
                icon="walk"
                iconColor="#EF4444"
                iconBg="rgba(239, 68, 68, 0.1)"
             />
              <HabitCard
                title="Morning Meditation"
                description="15 mins remaining"
                icon="flower"
                iconColor="#A855F7"
                iconBg="rgba(168, 85, 247, 0.1)"
             />
              <HabitCard
                title="Read 10 Pages"
                description="Daily Goal"
                icon="book"
                iconColor="#F59E0B"
                iconBg="rgba(245, 158, 11, 0.1)"
             />
              <HabitCard
                title="Drink Water"
                description="2L Completed"
                icon="water"
                iconColor="#38BDF8"
                iconBg="rgba(56, 189, 248, 0.1)"
             />
              <HabitCard
                title="Sleep 8h"
                description="Tonight"
                icon="moon"
                iconColor="#64748B"
                iconBg="rgba(100, 116, 139, 0.1)"
             />
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
            elevation: 5
         }}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </ApContainer>
  );
};

export default Home;
