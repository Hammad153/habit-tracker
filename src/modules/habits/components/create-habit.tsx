import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useAuthState } from "@/src/modules/auth/context";
import { ToastService, NotificationService } from "@/src/services";
import { LinearGradient } from "expo-linear-gradient";
import { useFeedback } from "@/src/utils/feedback";
import { HABIT_COLORS, HABIT_ICONS } from "@/src/constants";
import { DAYS_OF_WEEK } from "@/src/modules/reminders/model";
import { ReminderApiService } from "@/src/modules/reminders/api";
import ReminderPicker from "@/src/modules/reminders/components/ReminderPicker";
import SchedulePicker from "@/src/modules/habits/components/SchedulePicker";
import { useNotificationsState } from "@/src/modules/notifications/context";

const CreateHabitScreen = () => {
  const colors = useTheme();
  const { user } = useAuthState();
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("water");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { createHabit } = useHabitState();
  const { addNotification } = useNotificationsState();
  const { triggerSelection, triggerSuccess } = useFeedback();

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderDays, setReminderDays] = useState<string[]>([...DAYS_OF_WEEK]);

  // Schedule state
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [intervalDays, setIntervalDays] = useState(2);

  const handleCreate = () => {
    if (!name.trim()) {
      ToastService.Error("Please enter a habit name");
      return;
    }
    setLoading(true);
    createHabit({
      title: name,
      subtitle: subtitle.trim() || undefined,
      icon: selectedIcon,
      iconColor: selectedColor,
      iconBg: `${selectedColor}20`,
      scheduleType,
      scheduleDays: scheduleType === "specific_days" ? scheduleDays : [],
      timesPerWeek: scheduleType === "times_per_week" ? timesPerWeek : undefined,
      intervalDays: scheduleType === "interval" ? intervalDays : undefined,
    })
      .then((result: any) => {
        if (!result?.id) return;
        // Create reminder if enabled and habit was created
        if (reminderEnabled && result?.id && user?.id) {
          return ReminderApiService.create({
            userId: user.id,
            habitId: result.id,
            time: reminderTime,
            days: reminderDays,
          }).then(() =>
            NotificationService.scheduleHabitReminder(
              result.id,
              name,
              reminderTime,
              reminderDays,
            ),
          ).then(() =>
            addNotification({
              title: "Reminder scheduled",
              body: `${name} will remind you at ${reminderTime}.`,
              type: "habit",
              route: "/(tabs)/habits",
            }),
          );
        }
        return addNotification({
          title: "Habit created",
          body: `${name} is ready to track.`,
          type: "habit",
          route: "/(tabs)/habits",
        });
      })
      .then(() => {
        triggerSuccess();
        router.back();
      })
      .finally(() => {
        setLoading(false);
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
    <ApContainer>
      <ApHeader title="New Habit" hasBackButton />

      {/* Browse Templates Banner */}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 112 }}
      >
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
        </View>
      </ScrollView>

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
