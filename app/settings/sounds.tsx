import React from "react";
import { View, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "@/src/components/Text";
import { useSettings } from "@/src/context/SettingsContext";
import ApContainer from "@/src/components/containers/container";
import { ApHeader } from "@/src/components/Header";

export default function SoundsScreen() {
  const {
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    colors,
  } = useSettings();

  const settings = [
    {
      id: "haptic",
      label: "Haptic Feedback",
      icon: "finger-print",
      value: hapticEnabled,
      onToggle: setHapticEnabled,
      description:
        "Vibrate when completing habits or interacting with the app.",
    },
    {
      id: "sound",
      label: "Sound Effects",
      icon: "volume-high",
      value: soundEnabled,
      onToggle: setSoundEnabled,
      description:
        "Play sounds when completing goals or receiving notifications.",
    },
  ];

  return (
    <ApContainer className="flex-1">
      <ApHeader
        title="Sounds & Haptics"
        hasBackButton
        onBack={() => router.back()}
      />
      <ScrollView className="flex-1 px-5 pt-6">
        <ApText
          size="sm"
          color={colors.textMuted}
          className="mb-4 uppercase"
          font="bold">
          Feedback
        </ApText>
        <View className="bg-surface rounded-2xl overflow-hidden">
          {settings.map((item, index) => (
            <View
              key={item.id}
              className={`p-4 ${index !== settings.length - 1 ? "border-b" : ""}`}
              style={{ borderBottomColor: colors.surfaceBorder }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: colors.background }}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <ApText size="base" color="white" font="semibold">
                    {item.label}
                  </ApText>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{
                    false: colors.surfaceInactive,
                    true: colors.primary + "80",
                  }}
                  thumbColor={item.value ? colors.primary : colors.textMuted}
                />
              </View>
              <ApText size="xs" color={colors.textMuted} className="mt-2 ml-14">
                {item.description}
              </ApText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ApContainer>
  );
}
