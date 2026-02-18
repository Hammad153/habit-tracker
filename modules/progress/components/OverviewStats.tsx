import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";

const OverviewStats = () => {
  return (
    <View className="flex-row gap-4 mb-6">
      <View
        className="flex-1 p-4 rounded-2xl"
        style={{
          backgroundColor: ApTheme.Color.surface,
          borderColor: ApTheme.Color.surfaceBorder,
          borderWidth: 1,
        }}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-full bg-orange-500/20 items-center justify-center mr-2">
            <Ionicons name="flame" size={16} color="#F97316" />
          </View>
          <View>
            <ApText size="xs" color={ApTheme.Color.textMuted}>
              Current
            </ApText>
            <ApText size="xs" color={ApTheme.Color.textMuted}>
              Streak
            </ApText>
          </View>
        </View>
        <View className="flex-row items-baseline">
          <ApText size="3xl" font="bold" color="white" className="mr-1">
            12
          </ApText>
          <ApText size="sm" color={ApTheme.Color.textMuted}>
            Days
          </ApText>
        </View>
      </View>

      <View
        className="flex-1 p-4 rounded-2xl"
        style={{
          backgroundColor: ApTheme.Color.surface,
          borderColor: ApTheme.Color.surfaceBorder,
          borderWidth: 1,
        }}
      >
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center mr-2">
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          </View>
          <View>
            <ApText size="xs" color={ApTheme.Color.textMuted}>
              Total Done
            </ApText>
            <ApText size="xs" color="transparent">
              .
            </ApText>
          </View>
        </View>
        <View className="flex-row items-baseline">
          <ApText size="3xl" font="bold" color="white" className="mr-1">
            45
          </ApText>
          <ApText size="sm" color={ApTheme.Color.textMuted}>
            Habits
          </ApText>
        </View>
      </View>
    </View>
  );
};

export default OverviewStats;
