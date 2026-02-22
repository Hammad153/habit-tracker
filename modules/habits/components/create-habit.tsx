import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText } from "../../../src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { useCreateHabit } from "@/hooks/useHabits";
import { toast } from "@/src/services/toast";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { HABIT_COLORS, HABIT_ICONS } from "@/src/constants";

export default function CreateHabitScreen() {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const { mutate: createHabit, isPending: loading } = useCreateHabit();

  const handleCreate = () => {
    if (!name.trim()) {
      toast.show("Please enter a habit name", "error");
      return;
    }
    createHabit(
      {
        title: name,
        icon: selectedIcon,
        iconColor: selectedColor,
        iconBg: `${selectedColor}20`,
      },
      {
        onSuccess: () => {
          router.back();
          toast.show("Habit created successfully", "success");
        },
      },
    );
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    Haptics.selectionAsync();
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: -60,
        backgroundColor: ApTheme.Color.background,
      }}>
      <View className="flex-row items-center justify-center px-5 py-4">
        <ApText size="lg" font="bold" color="white">
          New Habit
        </ApText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Live Preview Card */}
        <View className="px-5 mt-4">
          <LinearGradient
            colors={[selectedColor + "40", ApTheme.Color.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 rounded-3xl border border-white/10">
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${selectedColor}20` }}>
                <Ionicons
                  name={selectedIcon as any}
                  size={32}
                  color={selectedColor}
                />
              </View>
              <View className="ml-4 flex-1">
                <ApText size="lg" font="bold" color="white" numberOfLines={1}>
                  {name || "Habit Name"}
                </ApText>
                <ApText size="xs" color={ApTheme.Color.textMuted}>
                  Live Preview
                </ApText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="px-5 mt-8">
          {/* Habit Name Section */}
          <ApText
            size="xs"
            font="bold"
            color={ApTheme.Color.textMuted}
            className="mb-2 uppercase"
            style={{ letterSpacing: 1 }}>
            Basic Information
          </ApText>
          <View className="bg-surface rounded-2xl p-4 border border-white/5">
            <TextInput
              className="text-white text-lg p-0"
              placeholder="e.g. Drink 2L Water"
              placeholderTextColor={ApTheme.Color.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Color Selection Section */}
          <ApText
            size="xs"
            font="bold"
            color={ApTheme.Color.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}>
            Appearance - Color
          </ApText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row">
            {HABIT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleColorSelect(color)}
                className="mr-3 items-center justify-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center border-2"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? "white" : "transparent",
                  }}>
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Icon Selection Section */}
          <ApText
            size="xs"
            font="bold"
            color={ApTheme.Color.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}>
            Appearance - Icon
          </ApText>
          <View className="flex-row flex-wrap justify-between">
            {HABIT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => handleIconSelect(icon)}
                className={`w-[22%] aspect-square mb-4 rounded-2xl items-center justify-center border ${
                  selectedIcon === icon
                    ? "border-white/20 bg-white/10"
                    : "border-white/5 bg-surface"
                }`}>
                <Ionicons
                  name={icon as any}
                  size={24}
                  color={
                    selectedIcon === icon
                      ? selectedColor
                      : ApTheme.Color.textMuted
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="flex-row items-center gap-2 justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-3/6 h-12 border flex items-center justify-center border-green-500/30 rounded-full px-5 py-2">
          <ApText size="base" color={ApTheme.Color.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          className={`w-3/6 h-12 flex items-center justify-center rounded-full ${
            loading ? "bg-gray-200" : "bg-background"
          }`}>
          <ApText
            size="sm"
            font="bold"
            color={loading ? ApTheme.Color.textMuted : "#FFFFFF"}>
            {loading ? "Creating..." : "Create"}
          </ApText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
