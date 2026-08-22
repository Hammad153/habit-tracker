import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApText,
  ApContainer,
  ApScrollView,
  ApModal,
  ApConfirmModal,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useIdentitiesState } from "./context";
import {
  IIdentity,
  IDENTITY_COLORS,
  IDENTITY_ICONS,
} from "./model";

const LEVEL_BAR_HEIGHT = 8;

const IdentityScreen = () => {
  const { colors } = useSettingsState();
  const { habits } = useHabitState();
  const {
    loading,
    activeIdentities,
    createIdentity,
    updateIdentity,
    deleteIdentity,
    linkHabit,
    unlinkHabit,
  } = useIdentitiesState();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<IIdentity | null>(null);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    icon: string;
    color: string;
  }>({ title: "", description: "", icon: "fitness", color: "#3B82F6" });
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<IIdentity | null>(null);

  const linkableHabits = useMemo(
    () => habits.filter((habit) => !habit.isArchived),
    [habits],
  );

  const linkedHabitIds = useMemo(() => {
    if (!editing) return new Set<string>();
    return new Set(
      (editing.habitLinks ?? []).map((link) => link.habit?.id ?? link.habitId),
    );
  }, [editing]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      icon: "fitness",
      color: "#3B82F6",
    });
    setSelectedHabitIds([]);
    setEditorVisible(true);
  };

  const openEdit = (identity: IIdentity) => {
    setEditing(identity);
    setForm({
      title: identity.title,
      description: identity.description ?? "",
      icon: identity.icon || "fitness",
      color: identity.color || "#3B82F6",
    });
    // Read links from the tapped identity directly; the memo still points at
    // the previous editor until React re-renders.
    setSelectedHabitIds(
      (identity.habitLinks ?? []).map((link) => link.habit?.id ?? link.habitId),
    );
    setEditorVisible(true);
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((current) =>
      current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId],
    );
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateIdentity(editing.id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon,
          color: form.color,
        });

        // Reconcile links to match the selection.
        const previous = linkedHabitIds;
        for (const habitId of selectedHabitIds) {
          if (!previous.has(habitId)) {
            await linkHabit(editing.id, habitId);
          }
        }
        for (const habitId of previous) {
          if (!selectedHabitIds.includes(habitId)) {
            await unlinkHabit(editing.id, habitId);
          }
        }
      } else {
        const created = await createIdentity({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon,
          color: form.color,
        });
        // Fresh identities have no id yet client-side until refetch; the
        // created object is returned so links can be attached immediately.
        if (created && selectedHabitIds.length > 0) {
          for (const habitId of selectedHabitIds) {
            await linkHabit(created.id, habitId);
          }
        }
      }
      setEditorVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const result = await deleteIdentity(confirmDelete.id);
    if (result?.archived) {
      // Identities with evidence are kept as history; surface that clearly.
      // The list refresh already moved it out of the active section.
    }
    setConfirmDelete(null);
  };

  const progressFor = (identity: IIdentity) => {
    const points = identity.evidencePoints ?? 0;
    const level = identity.level ?? 1;
    const pct = identity.progressToNextLevel;
    return { points, level, pct };
  };

  return (
    <ApContainer>
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-6 pb-2 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <View className="flex-1">
            <ApText size="2xl" font="bold" color={colors.textPrimary}>
              Identity
            </ApText>
            <ApText size="sm" color={colors.textMuted} className="mt-0.5">
              Every action is a vote for the person you want to become
            </ApText>
          </View>
        </View>

        {/* Active identities */}
        <View className="px-5 mt-4">
          {activeIdentities.length === 0 && !loading && (
            <View
              className="rounded-3xl p-6 items-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              }}
            >
              <Ionicons
                name="flag-outline"
                size={40}
                color={colors.textMuted}
              />
              <ApText
                size="base"
                font="semibold"
                color={colors.textPrimary}
                className="mt-3"
              >
                Who do you want to become?
              </ApText>
              <ApText
                size="xs"
                color={colors.textMuted}
                className="mt-1 text-center"
              >
                Create an identity like &quot;I am a runner&quot;, then link
                habits that prove it.
              </ApText>
            </View>
          )}

          {activeIdentities.map((identity) => {
            const accent = identity.color || colors.primary;
            const { points, level, pct } = progressFor(identity);
            return (
              <Pressable
                key={identity.id}
                onPress={() => openEdit(identity)}
                className="rounded-3xl p-4 mb-4"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: accent + "1E" }}
                  >
                    <Ionicons
                      name={(identity.icon || "flag") as any}
                      size={22}
                      color={accent}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <ApText
                      size="base"
                      font="bold"
                      color={colors.textPrimary}
                      numberOfLines={1}
                    >
                      {identity.title}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted}>
                      Level {level} · {identity.levelTitle}
                    </ApText>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: accent + "1A" }}
                  >
                    <ApText size="xs" font="bold" color={accent}>
                      {points} pts
                    </ApText>
                  </View>
                </View>

                {identity.description ? (
                  <ApText
                    size="xs"
                    color={colors.textSecondary}
                    className="mt-2"
                    numberOfLines={2}
                  >
                    {identity.description}
                  </ApText>
                ) : null}

                {/* Level bar */}
                <View
                  className="mt-3 rounded-full overflow-hidden"
                  style={{
                    height: LEVEL_BAR_HEIGHT,
                    backgroundColor: colors.surfaceBorder,
                  }}
                >
                  {pct != null && (
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: accent,
                      }}
                    />
                  )}
                </View>

                <View className="flex-row justify-between mt-2">
                  <ApText size="xs" color={colors.textMuted}>
                    {identity.linkedHabits ?? 0} linked habit
                    {(identity.linkedHabits ?? 0) === 1 ? "" : "s"}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {identity.completedOnDate ?? 0} today ·{" "}
                    {pct === null
                      ? "Max level reached"
                      : `${identity.pointsToNextLevel ?? 0} pts to level ${level + 1}`}
                  </ApText>
                </View>

                {(identity.habitLinks ?? []).length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {(identity.habitLinks ?? [])
                      .filter((link) => !link.habit?.isArchived)
                      .slice(0, 5)
                      .map((link) => (
                        <View
                          key={link.habitId}
                          className="flex-row items-center px-2 py-1 rounded-full mr-1.5 mb-1"
                          style={{
                            backgroundColor: colors.surfaceBorder + "80",
                          }}
                        >
                          <Ionicons
                            name={(link.habit?.icon || "ellipse") as any}
                            size={11}
                            color={link.habit?.iconColor || colors.primary}
                          />
                          <ApText
                            size="xs"
                            color={colors.textSecondary}
                            className="ml-1"
                            numberOfLines={1}
                          >
                            {link.habit?.title ?? "Habit"}
                          </ApText>
                        </View>
                      ))}
                  </View>
                )}
              </Pressable>
            );
          })}

          <TouchableOpacity
            onPress={openCreate}
            className="mb-6 h-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <ApText size="sm" font="bold" color={colors.background}>
              New Identity
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>

      {/* Create / edit editor */}
      <ApModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        title={editing ? "Edit Identity" : "New Identity"}
        subTitle='Phrase it as &quot;I am someone who...&quot;'
      >
        <ApScrollView showsVerticalScrollIndicator={false}>
          <ApText size="xs" font="semibold" color={colors.textSecondary}>
            IDENTITY
          </ApText>
          <TextInput
            value={form.title}
            onChangeText={(title) => setForm((f) => ({ ...f, title }))}
            placeholder="e.g. A runner"
            placeholderTextColor={colors.textMuted}
            className="mt-1.5 px-4 py-3 rounded-2xl"
            style={{
              backgroundColor: colors.surfaceBorder + "60",
              color: colors.textPrimary,
            }}
          />

          <ApText
            size="xs"
            font="semibold"
            color={colors.textSecondary}
            className="mt-4"
          >
            WHY IT MATTERS (OPTIONAL)
          </ApText>
          <TextInput
            value={form.description}
            onChangeText={(description) =>
              setForm((f) => ({ ...f, description }))
            }
            placeholder="What does this identity mean to you?"
            placeholderTextColor={colors.textMuted}
            multiline
            className="mt-1.5 px-4 py-3 rounded-2xl"
            style={{
              backgroundColor: colors.surfaceBorder + "60",
              color: colors.textPrimary,
              minHeight: 70,
              textAlignVertical: "top",
            }}
          />

          <ApText
            size="xs"
            font="semibold"
            color={colors.textSecondary}
            className="mt-4"
          >
            ICON
          </ApText>
          <View className="flex-row flex-wrap mt-2">
            {IDENTITY_ICONS.map((option) => (
              <TouchableOpacity
                key={option.name}
                onPress={() => setForm((f) => ({ ...f, icon: option.name }))}
                className="w-[18%] aspect-square items-center justify-center rounded-2xl mr-1.5 mb-1.5"
                style={{
                  backgroundColor:
                    form.icon === option.name
                      ? form.color + "26"
                      : colors.surfaceBorder + "50",
                  borderWidth: 1.5,
                  borderColor: form.icon === option.name ? form.color : "transparent",
                }}
              >
                <Ionicons
                  name={option.name as any}
                  size={20}
                  color={
                    form.icon === option.name ? form.color : colors.textMuted
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <ApText
            size="xs"
            font="semibold"
            color={colors.textSecondary}
            className="mt-3"
          >
            COLOR
          </ApText>
          <View className="flex-row flex-wrap mt-2 mb-1">
            {IDENTITY_COLORS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setForm((f) => ({ ...f, color: option.value }))}
                className="w-9 h-9 rounded-full mr-2.5 mb-2 items-center justify-center"
                style={{
                  backgroundColor: option.value,
                  borderWidth: 2.5,
                  borderColor:
                    form.color === option.value
                      ? colors.textPrimary
                      : "transparent",
                }}
              >
                {form.color === option.value && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <ApText
            size="xs"
            font="semibold"
            color={colors.textSecondary}
            className="mt-3"
          >
            PROVING HABITS
          </ApText>
          <ApText size="xs" color={colors.textMuted} className="mt-0.5">
            Completions of these habits count as evidence.
          </ApText>
          <View className="flex-row flex-wrap mt-2 mb-3">
            {linkableHabits.map((habit) => {
              // openEdit pre-seeds the selection from existing links, so the
              // chip state can rely on the selection alone.
              const checked = selectedHabitIds.includes(habit.id);
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => toggleHabitSelection(habit.id)}
                  className="flex-row items-center px-3 py-2 rounded-full mr-1.5 mb-1.5"
                  style={{
                    backgroundColor: checked
                      ? (form.color || colors.primary) + "1E"
                      : colors.surfaceBorder + "50",
                    borderWidth: 1.5,
                    borderColor: checked
                      ? form.color || colors.primary
                      : "transparent",
                  }}
                >
                  <Ionicons
                    name={habit.icon as any}
                    size={13}
                    color={checked ? form.color : colors.textMuted}
                  />
                  <ApText
                    size="xs"
                    font={checked ? "semibold" : "normal"}
                    color={checked ? colors.textPrimary : colors.textSecondary}
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

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !form.title.trim()}
            className="h-12 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                saving || !form.title.trim()
                  ? colors.surfaceInactive
                  : colors.primary,
            }}
          >
            <ApText
              size="sm"
              font="bold"
              color={
                saving || !form.title.trim()
                  ? colors.textMuted
                  : colors.background
              }
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create identity"}
            </ApText>
          </TouchableOpacity>

          {editing && (
            <TouchableOpacity
              onPress={() => {
                setEditorVisible(false);
                setConfirmDelete(editing);
              }}
              className="mt-2 h-12 items-center justify-center rounded-full border mb-2"
              style={{ borderColor: colors.danger }}
            >
              <ApText size="sm" font="semibold" color={colors.danger}>
                Delete identity
              </ApText>
            </TouchableOpacity>
          )}
        </ApScrollView>
      </ApModal>

      <ApConfirmModal
        visible={!!confirmDelete}
        title="Delete identity?"
        subTitle={`${
          confirmDelete?.title ?? "This identity"
        } will be removed. If it has history, it is archived instead of deleted.`}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </ApContainer>
  );
};

export default IdentityScreen;
