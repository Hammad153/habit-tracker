import React from "react";
import ManageHabitsScreen from "../screens/manage-habits";
import { View, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "../components/Text";
import { ApTheme } from "../components/theme";
import { habitApi } from "@/libs/api";
import { useState } from "react";

export default function CreateHabitScreen() {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    try {
      await habitApi.create({
        title: name,
        icon: selectedIcon,
        iconColor: ApTheme.Color.primary,
        iconBg: "rgba(255,255,255,0.1)", // Default for new
      });
      router.back();
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ApTheme.Color.background }}
    >
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ApText size="base" color={ApTheme.Color.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>
        <ApText size="xl" font="bold" color="white">
          New Habit
        </ApText>
        <TouchableOpacity onPress={handleCreate} disabled={loading}>
          <ApText
            size="base"
            font="bold"
            color={loading ? ApTheme.Color.textMuted : ApTheme.Color.primary}
          >
            {loading ? "..." : "Create"}
          </ApText>
        </TouchableOpacity>
      </View>

      <View className="px-5 mt-6">
        <ApText
          size="sm"
          font="bold"
          color={ApTheme.Color.textMuted}
          className="mb-2"
        >
          HABIT NAME
        </ApText>
        <TextInput
          className="bg-surface border border-surface-border text-white p-4 rounded-xl text-lg"
          placeholder="e.g. Drink 2L Water"
          placeholderTextColor={ApTheme.Color.textMuted}
          value={name}
          onChangeText={setName}
        />

        <View className="mt-8">
          <ApText
            size="sm"
            font="bold"
            color={ApTheme.Color.textMuted}
            className="mb-4"
          >
            CHOOSE ICON
          </ApText>
          <View className="flex-row flex-wrap gap-4">
            {[
              "water",
              "book",
              "barbell",
              "flower",
              "moon",
              "create",
              "walk",
            ].map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-12 h-12 rounded-full items-center justify-center border ${
                  selectedIcon === icon
                    ? "border-primary bg-primary/20"
                    : "border-white/10 bg-surface"
                }`}
              >
                <Ionicons
                  name={icon as any}
                  size={24}
                  color={
                    selectedIcon === icon ? "white" : ApTheme.Color.primary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
