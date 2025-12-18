import React from "react";
import { View } from "react-native";
import { ApHeader } from "@/components/Header";
import ApContainer from "@/components/containers/container";
import { ApScrollView } from "@/components/ScrollView";

export default function ProgressScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader title="Progress" />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View></View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
