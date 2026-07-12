import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader, ApLoader } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useAuthState } from "@/src/modules/auth/context";
import { ToastService, NotificationService } from "@/src/services";
import { LinearGradient } from "expo-linear-gradient";
import { useFeedback } from "@/src/utils/feedback";
import { HABIT_CATEGORIES, HABIT_COLORS, HABIT_ICONS } from "@/src/constants";
import { DAYS_OF_WEEK, IReminder } from "@/src/modules/reminders/model";
import { ReminderApiService } from "@/src/modules/reminders/api";
import ReminderPicker from "@/src/modules/reminders/components/ReminderPicker";
import SchedulePicker from "@/src/modules/habits/components/SchedulePicker";
import { HabitService } from "@/src/modules/habits/api";
import { useNotificationsState } from "@/src/modules/notifications/context";

interface EditHabitScreenProps {
  habitId: string;
}

const EditHabitScreen: React.FC<EditHabitScreenProps> = ({ habitId }) => {
  const colors = useTheme();
  const { user } = useAuthState();
  const { updateHabit } = useHabitState();
  const { addNotification } = useNotificationsState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Habit fields
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("General");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  // Schedule state
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [intervalDays, setIntervalDays] = useState(2);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderDays, setReminderDays] = useState<string[]>([...DAYS_OF_WEEK]);
  const [existingReminder, setExistingReminder] = useState<IReminder | null>(null);

  // Load existing habit and reminder data
  const loadData = useCallback(async () => {
    try {
      setInitialLoading(true);

      // Fetch habit details
      const habit = await HabitService.getById(habitId);
      if (habit) {
        setName(habit.title || "");
        setSubtitle(habit.subtitle || "");
        setCategory(habit.category || "General");
        setSelectedIcon(habit.icon || "water");
        setSelectedColor(habit.iconColor || HABIT_COLORS[0]);
        setScheduleType(habit.scheduleType || "daily");
        setScheduleDays(habit.scheduleDays || []);
        setTimesPerWeek(habit.timesPerWeek || 3);
        setIntervalDays(habit.intervalDays || 2);
      }

      // Fetch existing reminder for this habit
      try {
        const reminders = await ReminderApiService.getByHabit(habitId);
        if (reminders && reminders.length > 0) {
          const reminder = reminders[0];
          setExistingReminder(reminder);
          setReminderEnabled(reminder.enabled);
          setReminderTime(reminder.time || "08:00");
          setReminderDays(reminder.days || [...DAYS_OF_WEEK]);
        }
      } catch {
        // No reminders for this habit — that's fine
      }
    } catch {
      ToastService.Error("Failed to load habit details");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  }, [habitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!name.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }

    setSaving(true);
    try {
      // Update the habit
      await updateHabit(habitId, {
        title: name,
        subtitle: subtitle.trim() || undefined,
        icon: selectedIcon,
        iconColor: selectedColor,
        iconBg: `${selectedColor}20`,
        category,
        scheduleType,
        scheduleDays: scheduleType === "specific_days" ? scheduleDays : [],
        timesPerWeek: scheduleType === "times_per_week" ? timesPerWeek : undefined,
        intervalDays: scheduleType === "interval" ? intervalDays : undefined,
      });

      // Handle reminder changes
      if (existingReminder) {
        if (reminderEnabled) {
          // Update existing reminder
          await ReminderApiService.update(existingReminder.id, {
            time: reminderTime,
            days: reminderDays,
            enabled: true,
          });
          await NotificationService.scheduleHabitReminder(
            habitId,
            name,
            reminderTime,
            reminderDays,
          );
          await addNotification({
            title: "Reminder updated",
            body: `${name} will remind you at ${reminderTime}.`,
            type: "habit",
            route: "/(tabs)/habits",
          });
        } else {
          // Disable reminder
          await ReminderApiService.update(existingReminder.id, {
            enabled: false,
          });
          await NotificationService.cancelHabitReminder(habitId);
          await addNotification({
            title: "Reminder disabled",
            body: `${name} reminders are turned off.`,
            type: "habit",
            route: "/(tabs)/habits",
          });
        }
      } else if (reminderEnabled && user?.id) {
        // Create new reminder
        await ReminderApiService.create({
          userId: user.id,
          habitId,
          time: reminderTime,
          days: reminderDays,
        });
        await NotificationService.scheduleHabitReminder(
          habitId,
          name,
          reminderTime,
          reminderDays,
        );
        await addNotification({
          title: "Reminder scheduled",
          body: `${name} will remind you at ${reminderTime}.`,
          type: "habit",
          route: "/(tabs)/habits",
        });
      }

      triggerSuccess();
      router.back();
    } catch {
      ToastService.Error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    triggerSelection();
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    triggerSelection();
  };

  if (initialLoading) {
    return (
      <ApContainer>
        <ApHeader title="Edit Habit" hasBackButton />
        <ApLoader label="Loading habit..." />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader title="Edit Habit" hasBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112 }}
      >
        {/* Live Preview */}
        <View className="px-5 mt-4 rounded-3xl">
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
                <Ionicons
                  name={selectedIcon as any}
                  size={24}
                  color={selectedColor}
                />
              </View>
              <View className="ml-4 flex-1">
                <ApText
                  size="base"
                  font="bold"
                  color={colors.textPrimary}
                  numberOfLines={1}
                >
                  {name || "Habit Name"}
                </ApText>
                {subtitle ? (
                  <ApText size="xs" color={colors.textSecondary} numberOfLines={1} className="mt-0.5">
                    {subtitle}
                  </ApText>
                ) : (
                  <ApText size="xs" color={colors.textMuted}>
                    Live Preview
                  </ApText>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        <View className="px-5 mt-8">
          {/* Name Input */}
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
            className="rounded-2xl p-3 space-y-2 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <TextInput
              className="text-base p-1 border-b"
              style={{ color: colors.textPrimary, borderBottomColor: colors.surfaceBorder }}
              placeholder="e.g. Drink 2L Water"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
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

          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Category
          </ApText>
          <View className="flex-row flex-wrap">
            {HABIT_CATEGORIES.map((item) => {
              const selected = category === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setCategory(item);
                    triggerSelection();
                  }}
                  className="mr-2 mb-2 rounded-full border px-4 py-2"
                  style={{
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.surfaceBorder,
                  }}
                >
                  <ApText
                    size="xs"
                    font="semibold"
                    color={selected ? colors.background : colors.textSecondary}
                  >
                    {item}
                  </ApText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Schedule Section */}
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Schedule
          </ApText>
          <SchedulePicker
            scheduleType={scheduleType}
            scheduleDays={scheduleDays}
            timesPerWeek={timesPerWeek}
            intervalDays={intervalDays}
            onScheduleTypeChange={setScheduleType}
            onScheduleDaysChange={setScheduleDays}
            onTimesPerWeekChange={setTimesPerWeek}
            onIntervalDaysChange={setIntervalDays}
          />

          {/* Color Picker */}
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

          {/* Icon Picker */}
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
                className="w-[22%] aspect-square mb-4 rounded-2xl items-center justify-center border"
                style={{
                  backgroundColor:
                    selectedIcon === icon
                      ? colors.primary + "20"
                      : colors.surface,
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

          {/* Reminder Section */}
          <View className="mt-8">
            <ApText
              size="xs"
              font="bold"
              color={colors.textMuted}
              className="mb-4 uppercase"
              style={{ letterSpacing: 1 }}
            >
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
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        className="flex-row items-center gap-2 justify-between px-4 py-4 border-t"
        style={{ backgroundColor: colors.background, borderColor: colors.surfaceBorder }}
      >
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
          onPress={handleSave}
          disabled={saving}
          className={`w-3/6 h-12 flex items-center justify-center rounded-full ${
            saving ? "bg-gray-200" : ""
          }`}
          style={{
            backgroundColor: saving ? colors.surfaceInactive : colors.primary,
          }}
        >
          <ApText
            size="sm"
            font="bold"
            color={saving ? colors.textMuted : colors.background}
          >
            {saving ? "Saving..." : "Save Changes"}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApContainer>
  );
};

export default EditHabitScreen;
