import React from "react";
import { ScrollView, View, Text } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApHeader } from "@/components/Header";
import ApContainer from "@/components/containers/container";

export default function ProfileScreen() {
  return (
    <ApContainer>
      <View className="h-screen">
        {/*<ApHeader title="Profile" hasBackButton />*/}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className=" px-4 py-6 space-y-6"
        >
          <View className="rounded-lg px-4 pb-4">
            <Text className="text-3xl font-bold pt-4 text-primary">
              Profile
            </Text>
          </View>
        </ScrollView>
      </View>
    </ApContainer>
  );
}
