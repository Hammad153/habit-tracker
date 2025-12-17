import React from "react";
import { View, ScrollView, Text } from "react-native";

export default function ProgressScreen() {
  return (
    <View className="h-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className=" px-4 py-6 space-y-6"
      >
        <View className="rounded-lg px-4 pb-4">
          <Text className="text-3xl font-bold text-primary">Progress</Text>
        </View>
      </ScrollView>
    </View>
  );
}
