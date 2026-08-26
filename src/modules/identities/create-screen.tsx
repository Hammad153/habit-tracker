import React, { useMemo, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApLoader,
  ApConfirmModal,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import { useHabitState } from "@/src/modules/habits/context";
import { useIdentitiesState } from "./context";
import { IIdentity, IDENTITY_COLORS, IDENTITY_ICONS } from "./model";

interface IdentityFormProps {
  /** When provided the screen operates in edit mode. */
  identity?: IIdentity;
}

/**
 * Full-page identity form — used for both create and edit.
 * The route files pass the `identity` prop when editing.
 */
const IdentityFormScreen = ({ identity }: IdentityFormProps) => {
  const colors = useTheme();
  const { habits } = useHabitState();
  const {
    createIdentity,
    updateIdentity,
    deleteIdentity,
    linkHabit,
    unlinkHabit,
  } = useIdentitiesState();

  const isEdit = !!identity;

  const [title, setTitle] = useState(identity?.title ?? "");
  const [description, setDescription] = useState(
    identity?.description ?? "",
  );
  const [icon, setIcon] = useState(identity?.icon ?? "fitness");
  const [color, setColor] = useState(
    identity?.color ?? IDENTITY_COLORS[0].value,
  );
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(() =>
    (identity?.habitLinks ?? []).map(
      (link) => link.habit?.id ?? link.habitId,
    ),
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linkableHabits = useMemo(
    () => habits.filter((h) => !h.isArchived),
    [habits],
  );

  const originalLinkedIds = useMemo(
    () =>
      new Set(
        (identity?.habitLinks ?? []).map(
          (link) => link.habit?.id ?? link.habitId,
        ),
      ),
    [identity],
  );

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((current) =>
      current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId],
    );
  };

  const handleSave = async () => {
    if (saving) return;
    if (!title.trim()) {
      ToastService.Error("Please name your identity");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateIdentity(identity.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        });
        // Reconcile habit links
        for (const habitId of selectedHabitIds) {
          if (!originalLinkedIds.has(habitId)) {
            await linkHabit(identity.id, habitId);
          }
        }
        for (const habitId of originalLinkedIds) {
          if (!selectedHabitIds.includes(habitId)) {
            await unlinkHabit(identity.id, habitId);
          }
        }
        ToastService.Success("Identity updated");
      } else {
        await createIdentity({
          title: title.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        });
        ToastService.Success("Identity created");
      }
      router.back();
    } catch (err) {
      ToastService.ApiError(err);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!identity) return;
    setConfirmDelete(false);
    await deleteIdentity(identity.id);
    router.back();
  };

  if (saving) {
    return (
      <ApLoader
        label={isEdit ? "Saving changes..." : "Creating identity..."}
      />
    );
  }

  return (
    <ApContainer>
      <ApHeader
        title={isEdit ? "Edit Identity" : "New Identity"}
        hasBackButton
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <ApText size="xs" font="semibold" color={colors.textSecondary}>
          IDENTITY
        </ApText>
        <ApText size="xs" color={colors.textMuted} className="mt-0.5 mb-1.5">
          Phrase it as &quot;I am someone who...&quot;
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

        <ApText
          size="xs"
          font="semibold"
          color={colors.textSecondary}
          className="mt-5"
        >
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

        <ApText
          size="xs"
          font="semibold"
          color={colors.textSecondary}
          className="mt-5"
        >
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

        <ApText
          size="xs"
          font="semibold"
          color={colors.textSecondary}
          className="mt-4"
        >
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

        {/* Proving Habits — only shown in edit mode */}
        {isEdit && (
          <>
            <ApText
              size="xs"
              font="semibold"
              color={colors.textSecondary}
              className="mt-5"
            >
              PROVING HABITS
            </ApText>
            <ApText size="xs" color={colors.textMuted} className="mt-0.5">
              Completions of these habits count as evidence.
            </ApText>
            <View className="flex-row flex-wrap mt-2 mb-3">
              {linkableHabits.map((habit) => {
                const checked = selectedHabitIds.includes(habit.id);
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => toggleHabitSelection(habit.id)}
                    className="flex-row items-center px-3 py-2 rounded-full mr-1.5 mb-1.5"
                    style={{
                      backgroundColor: checked
                        ? color + "1E"
                        : colors.surfaceBorder + "50",
                      borderWidth: 1.5,
                      borderColor: checked ? color : "transparent",
                    }}
                  >
                    <Ionicons
                      name={habit.icon as any}
                      size={13}
                      color={checked ? color : colors.textMuted}
                    />
                    <ApText
                      size="xs"
                      font={checked ? "semibold" : "normal"}
                      color={
                        checked ? colors.textPrimary : colors.textSecondary
                      }
                      className="ml-1.5"
                      numberOfLines={1}
                    >
                      {habit.title}
                    </ApText>
                  </TouchableOpacity>
                );
              })}
              {linkableHabits.length === 0 && (
                <ApText size="xs" color={colors.textMuted}>
                  No habits yet — create one first.
                </ApText>
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !title.trim()}
          className="h-14 rounded-full items-center justify-center flex-row mt-6"
          style={{
            backgroundColor: colors.primary,
            opacity: saving || !title.trim() ? 0.6 : 1,
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={22}
            color={colors.background}
          />
          <ApText
            size="base"
            font="bold"
            color={colors.background}
            className="ml-2"
          >
            {isEdit ? "Save Changes" : "Create Identity"}
          </ApText>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            onPress={() => setConfirmDelete(true)}
            className="mt-3 h-12 items-center justify-center rounded-full border"
            style={{ borderColor: colors.danger }}
          >
            <ApText size="sm" font="semibold" color={colors.danger}>
              Delete Identity
            </ApText>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ApConfirmModal
        visible={confirmDelete}
        title="Delete identity?"
        subTitle={`${
          identity?.title ?? "This identity"
        } will be removed. If it has history, it is archived instead of deleted.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </ApContainer>
  );
};

export default IdentityFormScreen;
