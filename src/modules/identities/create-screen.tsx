import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApLoader,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import { useIdentitiesState } from "./context";
import { IDENTITY_COLORS, IDENTITY_ICONS } from "./model";

/**
 * Phase 4.x UX — identity creation as a full page (was a cramped modal).
 */
const CreateIdentityScreen = () => {
  const colors = useTheme();
  const { createIdentity } = useIdentitiesState();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("fitness");
  const [color, setColor] = useState(IDENTITY_COLORS[0].value);
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    if (saving) return;
    if (!title.trim()) {
      ToastService.Error("Please name your identity");
      return;
    }
    setSaving(true);
    createIdentity({
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      color,
    })
      .then(() => {
        ToastService.Success("Identity created");
        router.back();
      })
      .catch((err) => {
        ToastService.ApiError(err);
        setSaving(false);
      });
  };

  if (saving) return <ApLoader label="Creating identity..." />;

  return (
    <ApContainer>
      <ApHeader title="New Identity" hasBackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <ApText size="xs" font="semibold" color={colors.textSecondary}>
          IDENTITY
        </ApText>
        <ApText size="xs" color={colors.textMuted} className="mt-0.5 mb-1.5">
          Phrase it as “I am someone who…”
        </ApText>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. A runner"
          placeholderTextColor={colors.textMuted}
          className="px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: colors.surfaceBorder + "60",
            color: colors.textPrimary,
          }}
        />

        <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-5">
          WHY IT MATTERS (OPTIONAL)
        </ApText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What does this identity mean to you?"
          placeholderTextColor={colors.textMuted}
          multiline
          className="mt-1.5 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: colors.surfaceBorder + "60",
            color: colors.textPrimary,
            minHeight: 90,
            textAlignVertical: "top",
          }}
        />

        <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-5">
          ICON
        </ApText>
        <View className="flex-row flex-wrap mt-2">
          {IDENTITY_ICONS.map((option) => (
            <TouchableOpacity
              key={option.name}
              onPress={() => setIcon(option.name)}
              accessibilityRole="radio"
              accessibilityState={{ selected: icon === option.name }}
              className="w-11 h-11 rounded-xl items-center justify-center mr-2 mb-2"
              style={{
                backgroundColor:
                  icon === option.name ? colors.primary + "26" : colors.surface,
                borderWidth: icon === option.name ? 2 : 1,
                borderColor:
                  icon === option.name ? colors.primary : colors.surfaceBorder,
              }}
            >
              <Ionicons
                name={option.name as any}
                size={20}
                color={icon === option.name ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-4">
          COLOR
        </ApText>
        <View className="flex-row flex-wrap mt-2">
          {IDENTITY_COLORS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setColor(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: color === option.value }}
              className="w-9 h-9 rounded-full mr-2 mb-2"
              style={{
                backgroundColor: option.value,
                borderWidth: color === option.value ? 3 : 0,
                borderColor: colors.textPrimary,
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Create identity"
          className="h-14 rounded-full items-center justify-center flex-row mt-6"
          style={{
            backgroundColor: colors.primary,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Ionicons name="checkmark-circle" size={22} color={colors.background} />
          <ApText size="base" font="bold" color={colors.background} className="ml-2">
            Create Identity
          </ApText>
        </TouchableOpacity>
      </ScrollView>
    </ApContainer>
  );
};

export default CreateIdentityScreen;
