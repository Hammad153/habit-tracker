import React from "react";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApHeader } from "@/components/Header";

export default function ProfileScreen() {
  return (
    <View className="h-screen">
      <ApHeader title="Profile" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View></View>
      </ApScrollView>
    </View>
  );
}
