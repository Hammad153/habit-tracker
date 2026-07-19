import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Platform } from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";

export interface HabitFormProps {
  habitId?: string;
}

const HabitForm: React.FC<HabitFormProps> = ({ habitId }) => {
  const isEditMode = Boolean(habitId);
  const colors = useTheme();
  const { user } = useAuthState();
  const { createHabit, updateHabit } = useHabitState();
  const { addNotification } = useNotificationsState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  const [initialLoading, setInitialLoading] = useState(isEditMode);
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

  // Date range state for temporary habits
  const [hasDateRange, setHasDateRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    if (selectedDate) {
      if (pickerMode === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
    if (mode === 'start') {
      setShowStartPicker(true);
    } else {
      setShowEndPicker(true);
    }
  };

  // Load existing habit and reminder data (only in edit mode)
  const loadData = useCallback(async () => {
    if (!habitId) return;
    
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
        
        // Load date range if present
        if (habit.startDate || habit.endDate) {
          setHasDateRange(true);
          setStartDate(habit.startDate ? new Date(habit.startDate) : undefined);
          setEndDate(habit.endDate ? new Date(habit.endDate) : undefined);
        }
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

  const handleSubmit = async () => {
    if (!name.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }

    // Validate date range if enabled
    if (hasDateRange) {
      if (!startDate || !endDate) {
        ToastService.Error("Please select both start and end dates");
        return;
      }
      if (endDate <= startDate) {
        ToastService.Error("End date must be after start date");
        return;
      }
    }

    setSaving(true);
    
    const habitData = {
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
      startDate: hasDateRange && startDate ? startDate.toISOString() : undefined,
      endDate: hasDateRange && endDate ? endDate.toISOString() : undefined,
    };

    try {
      if (isEditMode && habitId) {
        // Update existing habit
        await updateHabit(habitId, habitData);

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

        await addNotification({
          title: "Habit updated",
          body: `${name} has been updated.`,
          type: "habit",
          route: "/(tabs)/habits",
        });
      } else {
        // Create new habit
        const result: any = await createHabit(habitData);
        
        if (result?.id) {
          // Create reminder if enabled and habit was created
          if (reminderEnabled && user?.id) {
            await ReminderApiService.create({
              userId: user.id,
              habitId: result.id,
              time: reminderTime,
              days: reminderDays,
            });
            await NotificationService.scheduleHabitReminder(
              result.id,
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
          await addNotification({
            title: "Habit created",
            body: `${name} is ready to track.`,
            type: "habit",
            route: "/(tabs)/habits",
          });
        }
      }

      triggerSuccess();
      router.back();
    } catch {
      ToastService.Error(isEditMode ? "Failed to save changes" : "Failed to create habit");
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
        <ApHeader title={isEditMode ? "Edit Habit" : "New Habit"} hasBackButton />
        <ApLoader label="Loading habit..." />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader title={isEditMode ? "Edit Habit" : "New Habit"} hasBackButton />

      {/* Browse Templates Banner - Only in create mode */}
      {!isEditMode && (
        <TouchableOpacity
          onPress={() => router.push("/templates")}
          className="mx-5 mb-4 flex-row items-center justify-between px-4 py-3 rounded-2xl border"
          style={{
            backgroundColor: colors.primary + "10",
            borderColor: colors.primary + "30",
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="grid" size={18} color={colors.primary} />
            <ApText size="sm" font="semibold" color={colors.primary} className="ml-2">
              Browse Templates
            </ApText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}

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
          {/* Basic Information */}
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

          {/* Category */}
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

          {/* Duration Section - Date Range for Temporary Habits */}
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="mt-8 mb-4 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Duration (Optional)
          </ApText>
          <View
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <TouchableOpacity
              onPress={() => setHasDateRange(!hasDateRange)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={hasDateRange ? colors.primary : colors.textMuted}
                />
                <ApText
                  size="sm"
                  color={colors.textPrimary}
                  className="ml-3"
                >
                  Set a time period
                </ApText>
              </View>
              <View
                className="w-12 h-7 rounded-full p-1 justify-center"
                style={{
                  backgroundColor: hasDateRange
                    ? colors.primary
                    : colors.surfaceBorder,
                }}
              >
                <View
                  className="w-5 h-5 rounded-full bg-white"
                  style={{
                    alignSelf: hasDateRange ? "flex-end" : "flex-start",
                  }}
                />
              </View>
            </TouchableOpacity>

            {hasDateRange && (
              <View className="mt-4 space-y-3">
                <ApText size="xs" color={colors.textSecondary}>
                  The habit will automatically delete when the end date is reached.
                </ApText>
                
                {/* Start Date */}
                <TouchableOpacity
                  onPress={() => openDatePicker('start')}
                  className="flex-row items-center justify-between py-3 border-b"
                  style={{ borderBottomColor: colors.surfaceBorder }}
                >
                  <ApText size="sm" color={colors.textPrimary}>
                    Start Date
                  </ApText>
                  <View className="flex-row items-center">
                    <ApText
                      size="sm"
                      color={startDate ? colors.primary : colors.textMuted}
                    >
                      {formatDate(startDate)}
                    </ApText>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.textMuted}
                      className="ml-2"
                    />
                  </View>
                </TouchableOpacity>

                {/* End Date */}
                <TouchableOpacity
                  onPress={() => openDatePicker('end')}
                  className="flex-row items-center justify-between py-3"
                >
                  <ApText size="sm" color={colors.textPrimary}>
                    End Date
                  </ApText>
                  <View className="flex-row items-center">
                    <ApText
                      size="sm"
                      color={endDate ? colors.primary : colors.textMuted}
                    >
                      {formatDate(endDate)}
                    </ApText>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.textMuted}
                      className="ml-2"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Date Pickers */}
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={startDate || new Date()}
            />
          )}

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
          onPress={handleSubmit}
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
            {saving 
              ? (isEditMode ? "Saving..." : "Creating...") 
              : (isEditMode ? "Save Changes" : "Create")}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApContainer>
  );
};

export default HabitForm;