import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useAuthState } from "@/src/modules/auth/context";
import { NotificationService, ToastService } from "@/src/services";
import { useFeedback } from "@/src/utils/feedback";
import { HABIT_COLORS, HABIT_ICONS } from "@/src/constants";
import { DAYS_OF_WEEK } from "@/src/modules/reminders/model";
import { ReminderApiService } from "@/src/modules/reminders/api";
import ReminderPicker from "@/src/modules/reminders/components/ReminderPicker";
import { IHabit } from "@/src/modules/habits/model";
import { IHabitTemplate } from "../model";

interface TemplatePreviewModalProps {
  template: IHabitTemplate | null;
  visible: boolean;
  onClose: () => void;
  /** Fired after a habit is successfully created from the template. */
  onAdded: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  visible,
  onClose,
  onAdded,
}) => {
  const colors = useTheme();
  const { user } = useAuthState();
  const { createHabit } = useHabitState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [submitting, setSubmitting] = useState(false);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderDays, setReminderDays] = useState<string[]>([...DAYS_OF_WEEK]);

  // Prevents a double-tap from creating two habits before state settles.
  const submitLockRef = useRef(false);

  // Seed the form from the template every time the modal is opened.
  useEffect(() => {
    if (visible && template) {
      setTitle(template.title);
      setSubtitle(template.subtitle || "");
      setSelectedColor(template.iconColor || HABIT_COLORS[0]);
      setSelectedIcon(template.icon || "water");
      setReminderEnabled(false);
      setReminderTime("08:00");
      setReminderDays([...DAYS_OF_WEEK]);
      setSubmitting(false);
      submitLockRef.current = false;
    }
  }, [visible, template]);

  if (!template) return null;

  const handleAdd = () => {
    if (submitLockRef.current) return;
    if (!title.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }
    submitLockRef.current = true;
    setSubmitting(true);

    createHabit({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      icon: selectedIcon,
      iconColor: selectedColor,
      iconBg: `${selectedColor}20`,
      category: template.category,
      goal: template.goal,
      unit: template.unit,
      frequency: template.frequency,
      scheduleType: "daily",
    })
      .then((created) => {
        const habit = created as IHabit | void;
        if (reminderEnabled && habit?.id && user?.id) {
          return ReminderApiService.create({
            userId: user.id,
            habitId: habit.id,
            time: reminderTime,
            days: reminderDays,
          })
            .then(() =>
              NotificationService.scheduleHabitReminder(
                habit.id,
                title.trim(),
                reminderTime,
                reminderDays,
              ),
            )
            .catch(() => {
              // Reminder is non-critical; the habit was already created.
            });
        }
      })
      .then(() => {
        triggerSuccess();
        onAdded();
      })
      .finally(() => {
        setSubmitting(false);
        submitLockRef.current = false;
      });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    triggerSelection();
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    triggerSelection();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
        <View
          className="rounded-t-3xl"
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.surfaceBorder,
            maxHeight: "92%",
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <ApText size="xl" font="bold" color={colors.textPrimary}>
              Customize Habit
            </ApText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          >
            {/* Live preview */}
            <LinearGradient
              colors={[selectedColor + "40", colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 rounded-3xl border"
              style={{ borderColor: colors.surfaceBorder }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  <Ionicons name={selectedIcon as any} size={24} color={selectedColor} />
                </View>
                <View className="ml-4 flex-1">
                  <ApText size="base" font="bold" color={colors.textPrimary} numberOfLines={1}>
                    {title || template.title}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                    {template.category} • Goal {template.goal} {template.unit || "times"} •{" "}
                    {template.frequency || "Daily"}
                  </ApText>
                </View>
              </View>
              {subtitle ? (
                <ApText size="sm" color={colors.textSecondary} className="mt-2" numberOfLines={2}>
                  {subtitle}
                </ApText>
              ) : null}
            </LinearGradient>

            {/* Name */}
            <ApText size="xs" font="bold" color={colors.textMuted} className="mt-6 mb-2 uppercase" style={{ letterSpacing: 1 }}>
              Basic Information
            </ApText>
            <View
              className="rounded-2xl p-3 space-y-2 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <TextInput
                className="text-base p-1 border-b"
                style={{ color: colors.textPrimary, borderBottomColor: colors.surfaceBorder }}
                placeholder="Habit name"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                className="text-sm p-1"
                style={{ color: colors.textPrimary }}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textMuted}
                value={subtitle}
                onChangeText={setSubtitle}
              />
            </View>

            {/* Color */}
            <ApText size="xs" font="bold" color={colors.textMuted} className="mt-6 mb-3 uppercase" style={{ letterSpacing: 1 }}>
              Color
            </ApText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {HABIT_COLORS.map((color) => (
                <TouchableOpacity key={color} onPress={() => handleColorSelect(color)} className="mr-3">
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? colors.textPrimary : "transparent",
                    }}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={22} color={colors.background} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Icon */}
            <ApText size="xs" font="bold" color={colors.textMuted} className="mt-6 mb-3 uppercase" style={{ letterSpacing: 1 }}>
              Icon
            </ApText>
            <View className="flex-row flex-wrap justify-between">
              {HABIT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => handleIconSelect(icon)}
                  className="w-[22%] aspect-square mb-3 rounded-2xl items-center justify-center border"
                  style={{
                    backgroundColor: selectedIcon === icon ? colors.primary + "20" : colors.surface,
                    borderColor: selectedIcon === icon ? colors.primary : colors.surfaceBorder,
                  }}
                >
                  <Ionicons
                    name={icon as any}
                    size={22}
                    color={selectedIcon === icon ? selectedColor : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Reminder */}
            <View className="mt-4">
              <ApText size="xs" font="bold" color={colors.textMuted} className="mb-3 uppercase" style={{ letterSpacing: 1 }}>
                Reminder
              </ApText>
              <ReminderPicker
                time={reminderTime}
                days={reminderDays}
                enabled={reminderEnabled}
                onTimeChange={setReminderTime}
                onDaysChange={setReminderDays}
                onEnabledChange={setReminderEnabled}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            className="flex-row items-center gap-3 px-5 pt-3 pb-6"
            style={{ borderTopWidth: 1, borderColor: colors.surfaceBorder }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="w-2/6 h-12 border items-center justify-center rounded-full"
              style={{ borderColor: colors.surfaceBorder }}
            >
              <ApText size="base" color={colors.textMuted}>
                Cancel
              </ApText>
            </TouchableOpacity>
            <Pressable
              onPress={handleAdd}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Add habit"
              className="flex-1 h-12 items-center justify-center rounded-full flex-row"
              style={{ backgroundColor: submitting ? colors.surfaceInactive : colors.primary }}
            >
              <Ionicons
                name={submitting ? "hourglass" : "add"}
                size={20}
                color={submitting ? colors.textMuted : colors.background}
              />
              <ApText size="base" font="bold" color={submitting ? colors.textMuted : colors.background} className="ml-1">
                {submitting ? "Adding..." : "Add Habit"}
              </ApText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TemplatePreviewModal;
