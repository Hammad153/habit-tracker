import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "@/src/components/Text";
import { useSettings } from "@/src/context/SettingsContext";
import ApContainer from "@/src/components/containers/container";
import { ApHeader } from "@/src/components/Header";

export default function AppearanceScreen() {
  const { themeMode, setThemeMode, colors } = useSettings();

  const themes = [
    { id: "light", label: "Light", icon: "sunny" },
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "system", label: "System", icon: "settings" },
  ];

  return (
    <ApContainer className="flex-1">
      <ApHeader title="Appearance" hasBackButton onBack={() => router.back()} />
      <ScrollView className="flex-1 px-5 pt-6">
        <ApText
          size="sm"
          color={colors.textMuted}
          className="mb-4 uppercase"
          font="bold">
          Theme Mode
        </ApText>
        <View className="bg-surface rounded-2xl overflow-hidden">
          {themes.map((theme, index) => (
            <TouchableOpacity
              key={theme.id}
              onPress={() => setThemeMode(theme.id as any)}
              className={`flex-row items-center justify-between p-4 ${
                index !== themes.length - 1 ? "border-b" : ""
              }`}
              style={{ borderBottomColor: colors.surfaceBorder }}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: colors.background }}>
                  <Ionicons
                    name={theme.icon as any}
                    size={20}
                    color={
                      themeMode === theme.id ? colors.primary : colors.textMuted
                    }
                  />
                </View>
                <ApText
                  size="base"
                  color={
                    themeMode === theme.id ? "white" : colors.textSecondary
                  }
                  font={themeMode === theme.id ? "bold" : "medium"}>
                  {theme.label}
                </ApText>
              </View>
              {themeMode === theme.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <ApText size="xs" color={colors.textMuted} className="mt-4 px-2">
          System mode will automatically switch between light and dark themes
          based on your device settings.
        </ApText>
      </ScrollView>
    </ApContainer>
  );
}
