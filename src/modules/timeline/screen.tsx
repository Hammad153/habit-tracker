import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { ApEmptyState, ApHeader, SkeletonCard } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { toDateKey } from "@/src/utils/date";
import { CalendarEventCard } from "./components/CalendarEventCard";
import { MonthCalendar } from "./components/MonthCalendar";
import { getEventsForDate } from "./calendar-utils";

export const TimelineScreen = () => {
  const colors = useTheme();
  const { habits, loading: habitsLoading, fetchHabits, toggleHabit } = useHabitState();
  const { profile, fetchProfile } = useProfileState();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const events = useMemo(() => getEventsForDate(habits, selectedDate), [habits, selectedDate]);

  useEffect(() => { void fetchHabits(); void fetchProfile(); }, []);

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <View className="flex-1 bg-background">
      <ApHeader title="Your journey" subtitle="Calendar" hasBackButton />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 60 }}>
        <View className="flex-row items-end justify-between py-4">
          <View><Text className="text-[26px] font-bold" style={{ color: colors.inkPrimary }}>{profile?.currentStreak ?? 0}</Text><Text className="text-[12px]" style={{ color: colors.inkSecondary }}>day streak</Text></View>
          <View className="items-end"><Text className="text-[26px] font-bold" style={{ color: colors.accent }}>{Math.round((profile?.completionRate ?? 0) * 100)}%</Text><Text className="text-[12px]" style={{ color: colors.inkSecondary }}>completion rate</Text></View>
        </View>
        <MonthCalendar month={month} selectedDate={selectedDate} today={today} habits={habits} onMonthChange={(offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))} onDateChange={selectDate} />
        <View className="flex-row items-center justify-between mt-6 mb-3">
          <View><Text className="text-[18px] font-bold" style={{ color: colors.inkPrimary }}>{format(selectedDate, "EEEE, MMM d")}</Text><Text className="text-[12px] mt-1" style={{ color: colors.inkSecondary }}>{events.length ? `${events.length} scheduled ${events.length === 1 ? "event" : "events"}` : "Nothing scheduled"}</Text></View>
          {toDateKey(selectedDate) === toDateKey(today) && <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: colors.accentSoft }}><Text className="text-[11px] font-bold" style={{ color: colors.accent }}>TODAY</Text></View>}
        </View>
        {habitsLoading && !habits.length ? <View className="gap-3"><SkeletonCard height={82} /><SkeletonCard height={82} /></View> : events.length ? <View className="gap-3">{events.map((event) => <CalendarEventCard key={`${event.habit.id}-${event.dateKey}`} event={event} onToggle={() => { if (event.status !== "upcoming") void toggleHabit(event.habit.id, event.dateKey); }} />)}</View> : <ApEmptyState title="No habits for this day" description="Choose another date or create a habit with a schedule for this day." />}
      </ScrollView>
    </View>
  );
};

export default TimelineScreen;
