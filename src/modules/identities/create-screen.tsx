import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { X, Check } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApTextInput,
  Button,
  ApConfirmModal,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import { useHabitState } from "@/src/modules/habits/context";
import { useIdentitiesState } from "./context";
import { IIdentity, IDENTITY_COLORS, IDENTITY_ICONS } from "./model";
import { getLucideIcon, CATEGORY_CYCLE } from "@/src/utils/icons";

interface IdentityFormProps {
  identity?: IIdentity;
}

export const IdentityFormScreen = ({ identity }: IdentityFormProps) => {
  const colors = useTheme();
  const { habits } = useHabitState();
  const {
    createIdentity,
    updateIdentity,
    deleteIdentity,
    linkHabit,
    unlinkHabit,
  } = useIdentitiesState();

  const isEdit = Boolean(identity);

  const [title, setTitle] = useState(identity?.title ?? "");
  const [description, setDescription] = useState(identity?.description ?? "");
  const [icon, setIcon] = useState(identity?.icon ?? "target");
  const [color, setColor] = useState(identity?.color ?? IDENTITY_COLORS[0].value);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(() =>
    (identity?.habitLinks ?? []).map((link) => link.habit?.id ?? link.habitId)
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linkableHabits = useMemo(
    () => habits.filter((h) => !h.isArchived),
    [habits]
  );

  const originalLinkedIds = useMemo(
    () =>
      new Set(
        (identity?.habitLinks ?? []).map(
          (link) => link.habit?.id ?? link.habitId
        )
      ),
    [identity]
  );

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((current) =>
      current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId]
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
      if (isEdit && identity) {
        await updateIdentity(identity.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        });
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
        const created = await createIdentity({
          title: title.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        });
        if (created && (created as any).id) {
          for (const habitId of selectedHabitIds) {
            await linkHabit((created as any).id, habitId);
          }
        }
        ToastService.Success("Identity created");
      }
      router.back();
    } catch {
      ToastService.Error("Failed to save identity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!identity) return;
    try {
      await deleteIdentity(identity.id);
      ToastService.Success("Identity deleted");
      router.back();
    } catch {
      ToastService.Error("Failed to delete identity");
    }
  };

  return (
    <View className="flex-1 justify-end bg-background">
      <View className="flex-1" style={{ backgroundColor: colors.overlay }}>
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View
          className="bg-background-elevated rounded-t-xl max-h-[92%] px-5 pt-3 pb-8"
          style={{
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 8,
          }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-3" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                {isEdit ? "Edit identity" : "New identity"}
              </Text>
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
              >
                <X size={20} color={colors.inkPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <ApTextInput
                label="Identity title"
                placeholder="e.g. Runner, Writer, Mindful person"
                value={title}
                onChangeText={setTitle}
                containerClassName="mb-3"
              />

              <ApTextInput
                label="Statement / Description"
                placeholder="Why is this identity important to you?"
                value={description}
                onChangeText={setDescription}
                containerClassName="mb-4"
              />

              {/* Icon */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Icon
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {IDENTITY_ICONS.map((item) => {
                  const IconComp = getLucideIcon(item.name);
                  const isSelected = icon === item.name;
                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => setIcon(item.name)}
                      className={"w-11 h-11 rounded-md items-center justify-center " + (isSelected ? "bg-background-inverse" : "bg-background-surface")}
                    >
                      <IconComp
                        size={20}
                        color={isSelected ? colors.inkInverse : colors.inkSecondary}
                        strokeWidth={2}
                      />
                    </Pressable>
                  );
                })}
              </View>

              {/* Linked Habits */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Linked habits that prove this
              </Text>
              {linkableHabits.length === 0 ? (
                <Text className="text-[13.5px] text-ink-secondary mb-4">
                  No habits to link yet. Create habits first.
                </Text>
              ) : (
                <View className="bg-background-surface rounded-lg px-4 py-1 mb-6">
                  {linkableHabits.map((habit, index) => {
                    const isSelected = selectedHabitIds.includes(habit.id);
                    const isLast = index === linkableHabits.length - 1;
                    return (
                      <Pressable
                        key={habit.id}
                        onPress={() => toggleHabitSelection(habit.id)}
                        className={"flex-row items-center justify-between py-3.5 " + (isLast ? "" : "border-b border-border")}
                      >
                        <Text className="text-[15px] font-medium text-ink-primary flex-1">
                          {habit.title}
                        </Text>
                        <View
                          className={"w-5 h-5 rounded-pill items-center justify-center " + (isSelected ? "bg-accent" : "border-[1.6px] border-border")}
                        >
                          {isSelected && <Check size={12} color={colors.inkInverse} strokeWidth={3} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View className="gap-3">
                <Button
                  label={saving ? "Saving..." : isEdit ? "Save changes" : "Create identity"}
                  onPress={handleSave}
                  loading={saving}
                  variant="primary"
                />

                {isEdit && (
                  <Button
                    label="Delete identity"
                    onPress={() => setConfirmDelete(true)}
                    variant="destructive"
                  />
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <ApConfirmModal
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete identity"
        description="Are you sure? This will not delete your linked habits."
        confirmText="Delete"
        isDestructive
      />
    </View>
  );
};

export default IdentityFormScreen;
