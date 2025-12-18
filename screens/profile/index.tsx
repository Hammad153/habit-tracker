import React from "react";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

export default function ProfileScreen() {
  return (
    <View className="h-screen">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <ApText size="2xl" font="bold" color={ApTheme.Color.primary}>
          Profile
        </ApText>
      </ApScrollView>
    </View>
  );
}
