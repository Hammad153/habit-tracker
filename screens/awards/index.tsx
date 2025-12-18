import React from "react";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";

export default function AwardsScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader title="Awards" />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View></View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
