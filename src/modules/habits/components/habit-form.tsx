import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { X, ChevronDown, Check, Clock, Calendar, Sparkles, Minus, Plus } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ApTextInput,
  ApTimeField,
  ApDatePicker,
  SwitchButton,
  Button,
  Dropdown,
  Skeleton,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useAuthState } from "@/src/modules/auth/context";
import { ToastService, NotificationService } from "@/src/services";
import { useFeedback } from "@/src/utils/feedback";
import { HABIT_CATEGORIES, HABIT_COLORS } from "@/src/constants";
import { DAYS_OF_WEEK, IReminder } from "@/src/modules/reminders/model";
import { ReminderApiService } from "@/src/modules/reminders/api";
import { HabitService } from "@/src/modules/habits/api";
import { useNotificationsState } from "@/src/modules/notifications/context";
import type { IHabitTemplate } from "@/src/modules/templates/model";
import { LUCIDE_HABIT_ICONS, getLucideIcon, CATEGORY_CYCLE } from "@/src/utils/icons";
import { CategoryKey } from "@/src/components/ListRow";

export interface HabitFormProps {
  habitId?: string;
}

const normalizeCueTime = (raw: string): string | null => {
  const t = raw.trim();
  if (!t) return null;
  const m =
    t.match(/(\\d{1,2})\\s*[:.h]\\s*(\\d{2})?\\s*(am|pm)?/i) ??
    t.match(/^(\\d{1,2})(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};

const DAY_LABELS: Record<string, string> = {
  Mon: "M",
  Tue: "T",
  Wed: "W",
  Thu: "T",
  Fri: "F",
  Sat: "S",
  Sun: "S",
  monday: "M",
  tuesday: "T",
  wednesday: "W",
  thursday: "T",
  friday: "F",
  saturday: "S",
  sunday: "S",
};

export const HabitForm: React.FC<HabitFormProps> = ({ habitId: propHabitId }) => {
  const params = useLocalSearchParams<{ habitId?: string; template?: string }>();
  const habitId = propHabitId || params.habitId;
  const isEditMode = Boolean(habitId);
  const colors = useTheme();
  const { user } = useAuthState();
  const { habits, createHabit, updateHabit } = useHabitState();
  const { addNotification } = useNotificationsState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Template prefill
  const template = useMemo<IHabitTemplate | null>(() => {
    if (isEditMode || !params.template) return null;
    try {
      return JSON.parse(params.template) as IHabitTemplate;
    } catch {
      return null;
    }
  }, [isEditMode, params.template]);

  // Form states
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("General");
  const [goal, setGoal] = useState("1");
  const [unit, setUnit] = useState("times");
  const [selectedIcon, setSelectedIcon] = useState("heart");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<CategoryKey>("mint");

  // Schedule
  const [scheduleType, setScheduleType] = useState<"daily" | "specific_days" | "times_per_week" | "interval">("daily");
  const [scheduleDays, setScheduleDays] = useState<string[]>([...DAYS_OF_WEEK]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [intervalDays, setIntervalDays] = useState(2);

  // Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderDays, setReminderDays] = useState<string[]>([...DAYS_OF_WEEK]);
  const [existingReminder, setExistingReminder] = useState<IReminder | null>(null);

  // Date range
  const [hasDateRange, setHasDateRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Behavioral layer
  const [showBehavioral, setShowBehavioral] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [location, setLocation] = useState("");
  const [fullBehavior, setFullBehavior] = useState("");
  const [minimumBehavior, setMinimumBehavior] = useState("");
  const [emergencyMinimum, setEmergencyMinimum] = useState("");
  const [stackAfterHabitId, setStackAfterHabitId] = useState<string | null>(null);

  // Seed from template
  useEffect(() => {
    if (!template) return;
    setName(template.title ?? "");
    setSubtitle(template.subtitle ?? "");
    if (template.icon) setSelectedIcon(template.icon);
    if (template.category) setCategory(template.category);
    setGoal(String(template.goal ?? 1));
    setUnit(template.unit ?? "times");
  }, [template]);

  // Load existing habit
  const loadData = useCallback(async () => {
    if (!habitId) return;
    try {
      setInitialLoading(true);
      const h = await HabitService.getById(habitId);
      if (h) {
        setName(h.title || "");
        setSubtitle(h.subtitle || "");
        setCategory(h.category || "General");
        setSelectedIcon(h.icon || "heart");
        setScheduleType((h.scheduleType as any) || "daily");
        setScheduleDays(h.scheduleDays || [...DAYS_OF_WEEK]);
        setTimesPerWeek(h.timesPerWeek || 3);
        setIntervalDays(h.intervalDays || 2);
        setGoal(String(h.goal || 1));
        setUnit(h.unit || "times");

        if (h.startDate || h.endDate) {
          setHasDateRange(true);
          setStartDate(h.startDate ? new Date(h.startDate) : undefined);
          setEndDate(h.endDate ? new Date(h.endDate) : undefined);
        }

        const hasBeh = Boolean(
          h.scheduledTime ||
            h.location ||
            h.fullBehavior ||
            h.minimumBehavior ||
            h.emergencyMinimum ||
            h.stackAfterHabitId
        );
        setShowBehavioral(hasBeh);
        setScheduledTime(h.scheduledTime ?? "");
        setLocation(h.location ?? "");
        setFullBehavior(h.fullBehavior ?? "");
        setMinimumBehavior(h.minimumBehavior ?? "");
        setEmergencyMinimum(h.emergencyMinimum ?? "");
        setStackAfterHabitId(h.stackAfterHabitId ?? null);
      }

      try {
        const reminders = await ReminderApiService.getByHabit(habitId);
        if (reminders && reminders.length > 0) {
          const rem = reminders[0];
          setExistingReminder(rem);
          setReminderEnabled(rem.enabled);
          setReminderTime(rem.time || "08:00");
          setReminderDays(rem.days || [...DAYS_OF_WEEK]);
        }
      } catch {
        // No existing reminder
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

  const toggleDaySelection = (day: string) => {
    triggerSelection();
    setScheduleDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
  };

  const toggleReminderDaySelection = (day: string) => {
    triggerSelection();
    setReminderDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }

    const parsedGoal = Number(goal);
    if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
      ToastService.Error("Enter a daily target of at least 1");
      return;
    }

    if (scheduleType === "specific_days" && scheduleDays.length === 0) {
      ToastService.Error("Please select at least one day");
      return;
    }

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
    const catTokens = colors.category[selectedCategoryKey];

    const habitData = {
      title: name.trim(),
      subtitle: subtitle.trim() || undefined,
      icon: selectedIcon,
      iconColor: catTokens.ink,
      iconBg: catTokens.bg,
      category,
      goal: Math.max(1, parsedGoal),
      unit: unit.trim() || "times",
      scheduleType,
      scheduleDays: scheduleType === "specific_days" ? scheduleDays : [],
      timesPerWeek: scheduleType === "times_per_week" ? timesPerWeek : undefined,
      intervalDays: scheduleType === "interval" ? intervalDays : undefined,
      startDate: hasDateRange && startDate ? startDate.toISOString() : undefined,
      endDate: hasDateRange && endDate ? endDate.toISOString() : undefined,
      scheduledTime: showBehavioral ? normalizeCueTime(scheduledTime) : null,
      location: showBehavioral && location.trim() ? location.trim() : null,
      fullBehavior: showBehavioral && fullBehavior.trim() ? fullBehavior.trim() : null,
      minimumBehavior: showBehavioral && minimumBehavior.trim() ? minimumBehavior.trim() : null,
      emergencyMinimum: showBehavioral && emergencyMinimum.trim() ? emergencyMinimum.trim() : null,
      stackAfterHabitId: showBehavioral ? stackAfterHabitId : null,
      identityIds: [],
    };

    try {
      if (isEditMode && habitId) {
        await updateHabit(habitId, habitData);

        if (existingReminder) {
          if (reminderEnabled) {
            await ReminderApiService.update(existingReminder.id, {
              time: reminderTime,
              days: reminderDays,
              enabled: true,
            });
            await NotificationService.scheduleHabitReminder(habitId, name, reminderTime, reminderDays);
          } else {
            await ReminderApiService.update(existingReminder.id, { enabled: false });
            await NotificationService.cancelHabitReminder(habitId);
          }
        } else if (reminderEnabled && user?.id) {
          await ReminderApiService.create({
            userId: user.id,
            habitId,
            time: reminderTime,
            days: reminderDays,
          });
          await NotificationService.scheduleHabitReminder(habitId, name, reminderTime, reminderDays);
        }

        await addNotification({
          title: "Habit updated",
          body: `${name} has been updated.`,
          type: "habit",
          route: "/(tabs)/habits",
        });
      } else {
        const res: any = await createHabit(habitData);
        if (res?.id && reminderEnabled && user?.id) {
          await ReminderApiService.create({
            userId: user.id,
            habitId: res.id,
            time: reminderTime,
            days: reminderDays,
          });
          await NotificationService.scheduleHabitReminder(res.id, name, reminderTime, reminderDays);
        }
        await addNotification({
          title: "Habit created",
          body: `${name} is ready to track.`,
          type: "habit",
          route: "/(tabs)/habits",
        });
      }

      triggerSuccess();
      router.back();
    } catch {
      ToastService.Error(isEditMode ? "Failed to save changes" : "Failed to create habit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 justify-end">
      {/* Dimmed backdrop */}
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay }}
        onPress={() => router.back()}
      />

      {/* Scrollable Bottom Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="w-full justify-end"
        style={{ maxHeight: "92%" }}
      >
        <View
          className="bg-background-elevated rounded-t-xl px-5 pt-3 pb-8 flex-col"
          style={{
            maxHeight: "100%",
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 8,
          }}
        >
          {/* Drag Handle */}
          <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-3" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
              {isEditMode ? "Edit habit" : "New habit"}
            </Text>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
            >
              <X size={20} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {initialLoading ? (
              <View className="gap-4 pt-2">
                <Skeleton width="30%" height={14} />
                <Skeleton width="100%" height={48} borderRadius={10} />
                <Skeleton width="25%" height={14} />
                <Skeleton width="100%" height={48} borderRadius={10} />
                <Skeleton width="35%" height={14} />
                <Skeleton width="100%" height={80} borderRadius={10} />
                <Skeleton width="100%" height={48} borderRadius={10} />
              </View>
            ) : (
              <>
              {/* Habit Name & Subtitle */}
              <ApTextInput
                label="Habit name"
                placeholder="e.g. Read 20 minutes"
                value={name}
                onChangeText={setName}
                containerClassName="mb-3"
              />

              <ApTextInput
                label="Why / Motivation (optional)"
                placeholder="What does this habit give you?"
                value={subtitle}
                onChangeText={setSubtitle}
                containerClassName="mb-4"
              />

              {/* Icon & Category Color */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Icon
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {LUCIDE_HABIT_ICONS.slice(0, 12).map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => {
                        setSelectedIcon(item.name);
                        triggerSelection();
                      }}
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

              {/* Category Color Palette */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Color tag
              </Text>
              <View className="flex-row gap-2 mb-4">
                {CATEGORY_CYCLE.map((catKey) => {
                  const isSelected = selectedCategoryKey === catKey;
                  const cat = colors.category[catKey];
                  return (
                    <Pressable
                      key={catKey}
                      onPress={() => {
                        setSelectedCategoryKey(catKey);
                        triggerSelection();
                      }}
                      className="w-8 h-8 rounded-pill items-center justify-center"
                      style={{
                        backgroundColor: cat.bg,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: cat.ink,
                      }}
                    >
                      {isSelected && <Check size={14} color={cat.ink} strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>

              {/* Category */}
              <Dropdown
                label="Category"
                options={HABIT_CATEGORIES.map((c) => ({ label: c, value: c }))}
                value={category}
                onChange={setCategory}
                className="mb-4"
              />

              {/* Frequency / Schedule */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Frequency
              </Text>
              <View className="flex-row gap-2 mb-3">
                {[
                  { id: "daily", label: "Every day" },
                  { id: "specific_days", label: "Specific days" },
                  { id: "times_per_week", label: "X per week" },
                ].map((opt) => (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      setScheduleType(opt.id as any);
                      triggerSelection();
                    }}
                    className={"px-3.5 py-1.5 rounded-pill " + (scheduleType === opt.id ? "bg-background-inverse" : "bg-background-surface")}
                  >
                    <Text
                      className={"text-[12px] font-semibold " + (scheduleType === opt.id ? "text-ink-inverse" : "text-ink-secondary")}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Specific days pills */}
              {scheduleType === "specific_days" && (
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = scheduleDays.includes(day);
                      return (
                        <Pressable
                          key={day}
                          onPress={() => toggleDaySelection(day)}
                          className={
                            "w-10 h-10 rounded-pill items-center justify-center " +
                            (isSelected
                              ? "bg-background-inverse"
                              : "bg-background-surface")
                          }
                          accessibilityLabel={day}
                        >
                          <Text
                            className={
                              "text-[13px] font-semibold " +
                              (isSelected
                                ? "text-ink-inverse"
                                : "text-ink-secondary")
                            }
                          >
                            {DAY_LABELS[day] || day[0]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text className="text-[11.5px] font-medium text-ink-tertiary">
                    {scheduleDays.length === 7
                      ? "Every day"
                      : scheduleDays.length === 0
                        ? "Select at least 1 day"
                        : `${scheduleDays.length} day${scheduleDays.length === 1 ? "" : "s"} selected`}
                  </Text>
                </View>
              )}

              {/* X per week selector */}
              {scheduleType === "times_per_week" && (
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2.5">
                    <Text className="text-[12px] font-medium text-ink-secondary">
                      {timesPerWeek} {timesPerWeek === 1 ? "time" : "times"} per week
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Pressable
                        onPress={() => {
                          setTimesPerWeek((prev) => Math.max(1, prev - 1));
                          triggerSelection();
                        }}
                        className="w-7 h-7 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
                        accessibilityLabel="Decrease times per week"
                      >
                        <Minus size={14} color={colors.inkPrimary} strokeWidth={2} />
                      </Pressable>
                      <Text className="text-[14px] font-bold text-ink-primary px-1">
                        {timesPerWeek}
                      </Text>
                      <Pressable
                        onPress={() => {
                          setTimesPerWeek((prev) => Math.min(6, prev + 1));
                          triggerSelection();
                        }}
                        className="w-7 h-7 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
                        accessibilityLabel="Increase times per week"
                      >
                        <Plus size={14} color={colors.inkPrimary} strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    {[1, 2, 3, 4, 5, 6].map((num) => {
                      const isSelected = timesPerWeek === num;
                      return (
                        <Pressable
                          key={num}
                          onPress={() => {
                            setTimesPerWeek(num);
                            triggerSelection();
                          }}
                          className={
                            "w-11 h-10 rounded-pill items-center justify-center " +
                            (isSelected
                              ? "bg-background-inverse"
                              : "bg-background-surface")
                          }
                        >
                          <Text
                            className={
                              "text-[13px] font-semibold " +
                              (isSelected
                                ? "text-ink-inverse"
                                : "text-ink-secondary")
                            }
                          >
                            {num}x
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Daily Target */}
              <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                Daily goal
              </Text>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <ApTextInput
                    label="Amount"
                    value={goal}
                    onChangeText={setGoal}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="flex-1">
                  <ApTextInput
                    label="Unit"
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="times, min, km"
                  />
                </View>
              </View>

              {/* Reminder Section */}
              <View className="flex-row items-center justify-between py-3 mb-2 border-t border-border">
                <View>
                  <Text className="text-[14px] font-semibold text-ink-primary">
                    Daily reminder
                  </Text>
                  <Text className="text-[12px] text-ink-secondary">
                    Receive a push notification
                  </Text>
                </View>
                <SwitchButton
                  value={reminderEnabled}
                  onValueChange={(val) => {
                    setReminderEnabled(val);
                  }}
                />
              </View>

              {reminderEnabled && (
                <View className="mb-4 bg-background-surface rounded-md p-3.5">
                  <ApTimeField
                    label="Reminder time"
                    placeholder="08:00"
                    value={reminderTime}
                    onChange={setReminderTime}
                    className="mb-3"
                  />
                  <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
                    Reminder days
                  </Text>
                  <View className="flex-row justify-between">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = reminderDays.includes(day);
                      return (
                        <Pressable
                          key={day}
                          onPress={() => toggleReminderDaySelection(day)}
                          className={"w-9 h-9 rounded-pill items-center justify-center " + (isSelected ? "bg-background-inverse" : "bg-background-surface2")}
                        >
                          <Text
                            className={"text-[12px] font-semibold " + (isSelected ? "text-ink-inverse" : "text-ink-secondary")}
                          >
                            {DAY_LABELS[day] || day[0]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Behavioral Setup Section (Atomic Habits) */}
              <View className="flex-row items-center justify-between py-3 mb-2 border-t border-border">
                <View className="flex-1 pr-2">
                  <Text className="text-[14px] font-semibold text-ink-primary">
                    Behavioral setup
                  </Text>
                  <Text className="text-[12px] text-ink-secondary">
                    Cue, small versions & habit stacking
                  </Text>
                </View>
                <SwitchButton
                  value={showBehavioral}
                  onValueChange={(val) => {
                    setShowBehavioral(val);
                  }}
                />
              </View>

              {showBehavioral && (
                <View className="mb-4 bg-background-surface rounded-md p-3.5 gap-3">
                  <ApTimeField
                    label="Cue time"
                    placeholder="07:30"
                    value={scheduledTime}
                    onChange={setScheduledTime}
                  />
                  <ApTextInput
                    label="Location (optional)"
                    placeholder="e.g. at my desk"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <ApTextInput
                    label="Minimum version"
                    placeholder="e.g. Read 1 page"
                    value={minimumBehavior}
                    onChangeText={setMinimumBehavior}
                  />
                  <ApTextInput
                    label="Emergency minimum"
                    placeholder="The bare minimum for very hard days"
                    value={emergencyMinimum}
                    onChangeText={setEmergencyMinimum}
                  />
                  {habits.filter((h) => h.id !== habitId && !h.isArchived).length > 0 && (
                    <Dropdown
                      label="Stack after habit"
                      options={[
                        { label: "None", value: "" },
                        ...habits
                          .filter((h) => h.id !== habitId && !h.isArchived)
                          .map((h) => ({ label: h.title, value: h.id })),
                      ]}
                      value={stackAfterHabitId || ""}
                      onChange={(val) => setStackAfterHabitId(val || null)}
                    />
                  )}
                </View>
              )}

              {/* Duration Section (Temporary Habit) */}
              <View className="flex-row items-center justify-between py-3 mb-2 border-t border-border">
                <View>
                  <Text className="text-[14px] font-semibold text-ink-primary">
                    Temporary habit
                  </Text>
                  <Text className="text-[12px] text-ink-secondary">
                    Set a start and end date
                  </Text>
                </View>
                <SwitchButton
                  value={hasDateRange}
                  onValueChange={(val) => {
                    setHasDateRange(val);
                  }}
                />
              </View>

              {hasDateRange && (
                <View className="mb-4 bg-background-surface rounded-md p-3.5 gap-2">
                  <Pressable
                    onPress={() => setShowStartPicker(true)}
                    className="flex-row items-center justify-between py-2 border-b border-border active:opacity-75"
                  >
                    <Text className="text-[14px] text-ink-primary">Start Date</Text>
                    <Text className="text-[14px] font-semibold text-accent">
                      {startDate ? startDate.toLocaleDateString() : "Select date"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowEndPicker(true)}
                    className="flex-row items-center justify-between py-2 active:opacity-75"
                  >
                    <Text className="text-[14px] text-ink-primary">End Date</Text>
                    <Text className="text-[14px] font-semibold text-accent">
                      {endDate ? endDate.toLocaleDateString() : "Select date"}
                    </Text>
                  </Pressable>

                  <ApDatePicker
                    visible={showStartPicker}
                    title="Select Start Date"
                    selectedDate={startDate || new Date()}
                    onClose={() => setShowStartPicker(false)}
                    onSelect={(d) => {
                      setStartDate(d);
                      setShowStartPicker(false);
                    }}
                  />
                  <ApDatePicker
                    visible={showEndPicker}
                    title="Select End Date"
                    selectedDate={endDate || startDate || new Date()}
                    minDate={startDate || undefined}
                    onClose={() => setShowEndPicker(false)}
                    onSelect={(d) => {
                      setEndDate(d);
                      setShowEndPicker(false);
                    }}
                  />
                </View>
              )}

              {/* Submit button */}
              <View className="mt-4">
                <Button
                  label={saving ? "Saving..." : isEditMode ? "Save changes" : "Create habit"}
                  onPress={handleSubmit}
                  loading={saving}
                  variant="primary"
                />
              </View>
            </>
          )}
        </ScrollView>
          </View>
        </KeyboardAvoidingView>
    </View>
  );
};

export default HabitForm;
