import React from "react";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

export default function AwardsScreen() {
  return (
    <View className="h-screen">
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className=" pb-4">
          <ApText size="2xl" font="bold" color={ApTheme.Color.primary}>
            Awards
          </ApText>
        </View>
      </ApScrollView>
    </View>
  );
}
