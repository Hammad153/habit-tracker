import React from "react";
import { View, ScrollView, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ApHeader from "@/components/Header";

export default function ProfileScreen() {
  return (
    <View className="h-screen">
      <ApHeader
        title="habit-tracker"
        icon={<FontAwesome name="moon-o" size={40} color="#4FA3A5" />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className=" px-4 py-6 space-y-6"
      >
        <View className="border-2 border-primary rounded-lg px-4 pb-4">
          <Text className="text-3xl font-bold pt-4 text-primary">Profile</Text>
        </View>
      </ScrollView>
    </View>
  );
}
