import React from "react";
import { View, Text } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";

export default function ProfileScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        <ApHeader title="Profile" hasBackButton />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View></View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
