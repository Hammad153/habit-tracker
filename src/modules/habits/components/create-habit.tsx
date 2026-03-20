import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { ToastService } from "@/src/services";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { HABIT_COLORS, HABIT_ICONS } from "@/src/constants";

const CreateHabitScreen = () => {
  const colors = useTheme();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { createHabit } = useHabitState();

  const handleCreate = () => {
    if (!name.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }
    setLoading(true);
    createHabit({
      title: name,
      icon: selectedIcon,
      iconColor: selectedColor,
      iconBg: `${selectedColor}20`,
    })
      .then(() => {
        router.back();
        ToastService.Success("Habit created successfully");
      })
      .finally(() => {
        setLoading(false);
      });
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
    <ApContainer>
      <ApHeader title="New Habit" hasBackButton />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5 mt-4 rounded-3xl">
          <LinearGradient
            colors={[selectedColor + "40", colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 rounded-3xl border"
            style={{ borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                <Ionicons
                  name={selectedIcon as any}
                  size={32}
                  color={selectedColor}
                />
              </View>
              <View className="ml-4 flex-1">
                <ApText
                  size="lg"
                  font="bold"
                  color={colors.textPrimary}
                  numberOfLines={1}
                >
                  {name || "Habit Name"}
                </ApText>
                <ApText size="xs" color={colors.textMuted}>
                  Live Preview
                </ApText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="px-5 mt-8">
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mb-2 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Basic Information
          </ApText>
          <View
            className="bg-surface rounded-2xl p-4 border"
            style={{ borderColor: colors.surfaceBorder }}
          >
            <TextInput
              className="text-lg p-0"
              style={{ color: colors.white }}
              placeholder="e.g. Drink 2L Water"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Appearance - Color
          </ApText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {HABIT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleColorSelect(color)}
                className="mr-3 items-center justify-center"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center border-2"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color
                        ? colors.textPrimary
                        : "transparent",
                  }}
                >
                  {selectedColor === color && (
                    <Ionicons
                      name="checkmark"
                      size={24}
                      color={colors.background}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Appearance - Icon
          </ApText>
          <View className="flex-row flex-wrap justify-between">
            {HABIT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => handleIconSelect(icon)}
                className={`w-[22%] aspect-square mb-4 rounded-2xl items-center justify-center border ${
                  selectedIcon === icon ? "bg-primary/20" : "bg-surface"
                }`}
                style={{
                  borderColor:
                    selectedIcon === icon
                      ? colors.primary
                      : colors.surfaceBorder,
                }}
              >
                <Ionicons
                  name={icon as any}
                  size={24}
                  color={
                    selectedIcon === icon ? selectedColor : colors.textMuted
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
          className="w-3/6 h-12 border flex items-center justify-center rounded-full px-5 py-2"
          style={{ borderColor: colors.surfaceBorder }}
        >
          <ApText size="base" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          className={`w-3/6 h-12 flex items-center justify-center rounded-full ${
            loading ? "bg-gray-200" : ""
          }`}
          style={{
            backgroundColor: loading ? colors.surfaceInactive : colors.primary,
          }}
        >
          <ApText
            size="sm"
            font="bold"
            color={loading ? colors.textMuted : colors.background}
          >
            {loading ? "Creating..." : "Create"}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApContainer>
  );
};

export default CreateHabitScreen;
