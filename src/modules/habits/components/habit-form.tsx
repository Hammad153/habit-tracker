import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader, ApLoader } from "@/src/components";
import { Dropdown } from "@/src/components/Dropdown";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useIdentitiesState } from "@/src/modules/identities/context";
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
import { useLocalSearchParams } from "expo-router";
import type { IHabitTemplate } from "@/src/modules/templates/model";

export interface HabitFormProps {
  habitId?: string;
}

/**
 * The cue field accepts human input ("7:30", "8pm", "07:30 after coffee").
 * Normalize to strict HH:mm for the API; unparseable text means "no time".
 */
const normalizeCueTime = (raw: string): string | null => {
  const t = raw.trim();
  if (!t) return null;
  const m =
    t.match(/(\d{1,2})\s*[:.h]\s*(\d{2})?\s*(am|pm)?/i) ??
    t.match(/^(\d{1,2})(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const CollapsibleSection: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, children }) => {
  const colors = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View
      className="rounded-2xl border mb-3 overflow-hidden"
      style={{ borderColor: colors.surfaceBorder }}
    >
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center px-4 py-3"
        style={{ backgroundColor: colors.background }}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
        <ApText
          size="xs"
          font="bold"
          color={colors.textSecondary}
          className="uppercase ml-2 flex-1"
          style={{ letterSpacing: 1 }}
        >
          {title}
        </ApText>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {open ? <View className="px-4 pb-4 pt-1">{children}</View> : null}
    </View>
  );
};

const HabitForm: React.FC<HabitFormProps> = ({ habitId }) => {
  const isEditMode = Boolean(habitId);
  const colors = useTheme();
  const { user } = useAuthState();
  const { createHabit, updateHabit, habits } = useHabitState();
  const { activeIdentities } = useIdentitiesState();
  const { addNotification } = useNotificationsState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  // Template prefill (Phase: align template flow with the full create page)
  const params = useLocalSearchParams<{ template?: string }>();
  const template = useMemo<IHabitTemplate | null>(() => {
    if (isEditMode || !params.template) return null;
    try {
      return JSON.parse(params.template) as IHabitTemplate;
    } catch {
      return null;
    }
  }, [isEditMode, params.template]);
  // Seed from a selected habit template (create mode only).
  useEffect(() => {
    if (!template) return;
    setName(template.title ?? "");
    setSubtitle(template.subtitle ?? "");
    if (template.icon) setSelectedIcon(template.icon);
    if (template.iconColor) {
      setSelectedColor(template.iconColor);
    }
    if (template.category) setCategory(template.category);
    setGoal(String(template.goal ?? 1));
    setUnit(template.unit ?? "times");
  }, [template]);

  // Habit fields
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("General");
  const [goal, setGoal] = useState("1");
  const [unit, setUnit] = useState("times");
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

  // Behavioral layer (implementation intention, versions, stacking, identity)
  const [showBehavioral, setShowBehavioral] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [location, setLocation] = useState("");
  const [fullBehavior, setFullBehavior] = useState("");
  const [minimumBehavior, setMinimumBehavior] = useState("");
  const [emergencyMinimum, setEmergencyMinimum] = useState("");
  const [stackAfterHabitId, setStackAfterHabitId] = useState<string | null>(null);
  const [identityIds, setIdentityIds] = useState<string[]>([]);

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

        // Behavioral layer
        const hasBehavioral =
          Boolean(
            habit.scheduledTime ||
              habit.location ||
              habit.fullBehavior ||
              habit.minimumBehavior ||
              habit.emergencyMinimum ||
              habit.stackAfterHabitId,
          ) || (habit.identityLinks?.length ?? 0) > 0;
        setShowBehavioral(hasBehavioral);
        setScheduledTime(habit.scheduledTime ?? "");
        setLocation(habit.location ?? "");
        setFullBehavior(habit.fullBehavior ?? "");
        setMinimumBehavior(habit.minimumBehavior ?? "");
        setEmergencyMinimum(habit.emergencyMinimum ?? "");
        setStackAfterHabitId(habit.stackAfterHabitId ?? null);
        setIdentityIds(
          (habit.identityLinks ?? []).map(
            (link: { identityId: string }) => link.identityId,
          ),
        );
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
      goal: Math.max(1, Number(goal) || 1),
      unit: unit.trim() || "times",
      scheduleType,
      scheduleDays: scheduleType === "specific_days" ? scheduleDays : [],
      timesPerWeek: scheduleType === "times_per_week" ? timesPerWeek : undefined,
      intervalDays: scheduleType === "interval" ? intervalDays : undefined,
      startDate: hasDateRange && startDate ? startDate.toISOString() : undefined,
      endDate: hasDateRange && endDate ? endDate.toISOString() : undefined,
      // Behavioral layer — empty strings are normalized to null so clearing a
      // field on the client actually clears it server-side.
      scheduledTime: showBehavioral
          ? normalizeCueTime(scheduledTime)
          : null,
      location: showBehavioral && location.trim() ? location.trim() : null,
      fullBehavior: showBehavioral && fullBehavior.trim() ? fullBehavior.trim() : null,
      minimumBehavior: showBehavioral && minimumBehavior.trim() ? minimumBehavior.trim() : null,
      emergencyMinimum: showBehavioral && emergencyMinimum.trim() ? emergencyMinimum.trim() : null,
      stackAfterHabitId: showBehavioral ? stackAfterHabitId : null,
      identityIds: showBehavioral ? identityIds : [],
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

  const accentColor = colors.primary;
  const handleSavePress = handleSubmit;

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

      {/* Browse templates — create mode only */}
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

      {initialLoading ? (
        <ApLoader label="Loading habit..." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* ── Live preview ── */}
          <View className="px-5 mt-1">
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
                    {name || "Habit Name"}
                  </ApText>
                  {subtitle ? (
                    <ApText size="xs" color={colors.textSecondary} numberOfLines={1} className="mt-0.5">
                      {subtitle}
                    </ApText>
                  ) : null}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* ── Basics ── */}
          <View className="px-5 mt-5">
            <ApText size="xs" font="semibold" color={colors.textSecondary}>
              HABIT NAME
            </ApText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Read before bed"
              placeholderTextColor={colors.textMuted}
              className="mt-1.5 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
            />

            <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-4">
              WHY (OPTIONAL)
            </ApText>
            <TextInput
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="What does this habit give you?"
              placeholderTextColor={colors.textMuted}
              className="mt-1.5 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
            />

            <View className="flex-row mt-4">
              <View className="flex-1 mr-2">
                <ApText size="xs" font="semibold" color={colors.textSecondary}>
                  DAILY TARGET
                </ApText>
                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  keyboardType="decimal-pad"
                  className="mt-1.5 px-4 py-3 rounded-2xl"
                  style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                />
              </View>
              <View className="flex-1">
                <ApText size="xs" font="semibold" color={colors.textSecondary}>
                  UNIT
                </ApText>
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="times, km…"
                  className="mt-1.5 px-4 py-3 rounded-2xl"
                  style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                />
              </View>
            </View>

            <Dropdown
              label="Category"
              options={HABIT_CATEGORIES.map((c: string) => ({ label: c, value: c }))}
              value={category}
              onChange={(v: string) => {
                setCategory(v);
                triggerSelection();
              }}
            />
          </View>

          {/* ── Collapsed detail sections ── */}
          <View className="px-5 mt-4">
            <CollapsibleSection title="Schedule & reminders" icon="time-outline" defaultOpen>
              <SchedulePicker
                scheduleType={scheduleType}
                scheduleDays={scheduleDays}
                timesPerWeek={timesPerWeek}
                intervalDays={intervalDays}
                onScheduleTypeChange={(t: string) => {
                  setScheduleType(t);
                  triggerSelection();
                }}
                onScheduleDaysChange={setScheduleDays}
                onTimesPerWeekChange={setTimesPerWeek}
                onIntervalDaysChange={setIntervalDays}
              />

              <View className="flex-row items-center justify-between mt-4 pt-3 border-t" style={{ borderTopColor: colors.surfaceBorder }}>
                <ApText size="sm" font="semibold" color={colors.textPrimary}>
                  Daily reminder
                </ApText>
                <Switch
                  value={reminderEnabled}
                  onValueChange={(v: boolean) => setReminderEnabled(v)}
                  trackColor={{ false: colors.surfaceBorder, true: colors.primary + "80" }}
                  thumbColor={reminderEnabled ? colors.primary : colors.textMuted}
                />
              </View>
              {reminderEnabled && (
                <ReminderPicker
                  time={reminderTime}
                  days={reminderDays}
                  enabled
                  onTimeChange={setReminderTime}
                  onDaysChange={setReminderDays}
                  onEnabledChange={() => undefined}
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Behavioral setup" icon="sparkles-outline">
              <View className="flex-row items-center justify-between pb-3 border-b" style={{ borderTopColor: colors.surfaceBorder }}>
                <ApText size="xs" color={colors.textSecondary} className="flex-1 pr-3">
                  Add cue time, smaller versions and habit stacking.
                </ApText>
                <Switch
                  value={showBehavioral}
                  onValueChange={(v: boolean) => setShowBehavioral(v)}
                  trackColor={{ false: colors.surfaceBorder, true: colors.primary + "80" }}
                  thumbColor={showBehavioral ? colors.primary : colors.textMuted}
                />
              </View>
              {showBehavioral && (
                <>
                  <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-3">
                    CUE TIME
                  </ApText>
                  <TextInput
                    value={scheduledTime}
                    onChangeText={setScheduledTime}
                    placeholder="e.g. 07:30"
                    className="mt-1.5 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                  />
                  <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-4">
                    FULL VERSION
                  </ApText>
                  <TextInput
                    value={fullBehavior}
                    onChangeText={setFullBehavior}
                    placeholder={`e.g. Read ${goal} ${unit}`}
                    className="mt-1.5 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                  />
                  <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-4">
                    MINIMUM VERSION
                  </ApText>
                  <TextInput
                    value={minimumBehavior}
                    onChangeText={setMinimumBehavior}
                    placeholder="e.g. Read one page"
                    className="mt-1.5 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                  />
                  <ApText size="xs" font="semibold" color={colors.textSecondary} className="mt-4">
                    EMERGENCY VERSION (CRISIS DAYS)
                  </ApText>
                  <TextInput
                    value={emergencyMinimum}
                    onChangeText={setEmergencyMinimum}
                    placeholder="The bare minimum for very hard days"
                    className="mt-1.5 px-4 py-3 rounded-2xl"
                    style={{ backgroundColor: colors.surfaceBorder + "60", color: colors.textPrimary }}
                  />
                </>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Duration (optional)" icon="calendar-clear-outline">
              <View className="flex-row items-center justify-between">
                <ApText size="sm" color={colors.textPrimary}>
                  Temporary habit (auto-deletes)
                </ApText>
                <Switch
                  value={hasDateRange}
                  onValueChange={(v: boolean) => setHasDateRange(v)}
                  trackColor={{ false: colors.surfaceBorder, true: colors.primary + "80" }}
                  thumbColor={hasDateRange ? colors.primary : colors.textMuted}
                />
              </View>
              {hasDateRange && (
                <>
                  <TouchableOpacity
                    onPress={() => openDatePicker('start')}
                    className="flex-row items-center justify-between py-3 mt-2 border-b"
                    style={{ borderBottomColor: colors.surfaceBorder }}
                  >
                    <ApText size="sm" color={colors.textPrimary}>Start Date</ApText>
                    <ApText size="sm" color={startDate ? colors.primary : colors.textMuted}>
                      {formatDate(startDate)}
                    </ApText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openDatePicker('end')}
                    className="flex-row items-center justify-between py-3"
                  >
                    <ApText size="sm" color={colors.textPrimary}>End Date</ApText>
                    <ApText size="sm" color={endDate ? colors.primary : colors.textMuted}>
                      {formatDate(endDate)}
                    </ApText>
                  </TouchableOpacity>
                </>
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Appearance" icon="color-palette-outline">
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase mb-2">
                Color
              </ApText>
              <View className="flex-row flex-wrap">
                {HABIT_COLORS.map((c: string) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      setSelectedColor(c);
                      triggerSelection();
                    }}
                    className="w-9 h-9 rounded-full mr-2 mb-2"
                    style={{
                      backgroundColor: c,
                      borderWidth: selectedColor === c ? 3 : 0,
                      borderColor: colors.textPrimary,
                    }}
                  />
                ))}
              </View>
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase mt-2 mb-2">
                Icon
              </ApText>
              <View className="flex-row flex-wrap">
                {HABIT_ICONS.map((iconName: string) => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => {
                      setSelectedIcon(iconName);
                      triggerSelection();
                    }}
                    className="w-11 h-11 rounded-xl items-center justify-center mr-2 mb-2"
                    style={{
                      backgroundColor:
                        selectedIcon === iconName
                          ? colors.primary + "26"
                          : colors.background,
                      borderWidth: selectedIcon === iconName ? 2 : 1,
                      borderColor:
                        selectedIcon === iconName ? colors.primary : colors.surfaceBorder,
                    }}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={20}
                      color={selectedIcon === iconName ? colors.primary : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </CollapsibleSection>
          </View>

          {/* Hidden date pickers */}
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
              value={endDate || startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={startDate || new Date()}
            />
          )}

          {/* Save */}
          <View className="px-5 mt-6">
            <TouchableOpacity
              onPress={handleSavePress}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={isEditMode ? 'Save habit changes' : 'Create habit'}
              className="h-14 rounded-full items-center justify-center flex-row"
              style={{
                backgroundColor: accentColor,
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Ionicons name="checkmark-circle" size={22} color={colors.background} />
              <ApText size="base" font="bold" color={colors.background} className="ml-2">
                {saving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Habit'}
              </ApText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      </ApContainer>
  );
};

export default HabitForm;
