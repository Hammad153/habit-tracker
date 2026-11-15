import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ArrowLeft, MoreHorizontal } from "lucide-react-native";
import { router } from "expo-router";
import { ApHeader } from "@/src/components/Header";
import { Button } from "@/src/components/buttons/Button";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { format } from "date-fns";

export interface BurialItem {
  id: string;
  title: string;
  habitCreatedAt: string;
  buriedAt: string;
  lastCompletedDay?: string | null;
  totalCompletions: number;
  bestStreak: number;
  reason?: string | null;
  epitaph: string;
  theme: string;
  restoredAt?: string | null;
  restartHabitId?: string | null;
}

export const GraveyardScreen: React.FC = () => {
  const colors = useTheme();
  const { burials, loading, fetchHabits } = useHabitState();

  const [filter, setFilter] = useState<"all" | "restored" | "active">("all");

  const filteredBurials = useMemo(() => {
    return burials.filter((burial) => {
      if (filter === "restored") return Boolean(burial.restoredAt);
      if (filter === "active") return !burial.restoredAt && !burial.restartHabitId;
      return true;
    });
  }, [burials, filter]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleViewBurial = (burialId: string) => {
    void router.push(`/graveyard/${burialId}` as never);
  };

  const handleCreateHabit = () => {
    router.push("/create-habit");
  };

  const renderList = () => (
    <View className="bg-background-surface rounded-xl overflow-hidden border border-border">
      {filteredBurials.map((burial) => (
        <Pressable
          key={burial.id}
          onPress={() => handleViewBurial(burial.id)}
          className="flex-row items-center justify-between px-4 py-3 border-b border-border last:border-0"
          accessibilityRole="button"
          accessibilityLabel={`View tombstone for ${burial.title}`}
        >
          <View className="flex-1 min-w-0">
            <Text
              className="text-[14px] font-semibold text-ink-primary"
              numberOfLines={1}
            >
              RIP — {burial.title}
            </Text>
            <Text className="text-[11px] text-ink-secondary">
              {format(new Date(burial.buriedAt), "MMM d, yyyy")} · {burial.totalCompletions} completions
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-[11px] font-medium text-ink-tertiary">
              {burial.bestStreak} day streak
            </Text>
            <View className="w-5 h-5 rounded-full bg-background-surface2" />
          </View>
        </Pressable>
      ))}
    </View>
  );

  const burialContent = renderList();

  const emptyContent = (
    <View className="items-center py-10">
      <Text className="text-[32px] mb-2">🪦</Text>
      <Text className="text-[18px] font-bold text-ink-primary mb-1">
        No casualties yet.
      </Text>
      <Text className="text-[14px] text-ink-secondary">
        Suspiciously impressive.
      </Text>
      <Button
        label="Create your first habit"
        onPress={handleCreateHabit}
        className="mt-6 w-full"
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
      >
        <View className="h-[56px] px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
            accessibilityLabel="Back to habits"
          >
            <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
          <Text className="text-[22px] font-bold text-ink-primary">
            Graveyard
          </Text>
          <Pressable
            onPress={() => router.push("/create-habit")}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
            accessibilityLabel="Create habit"
          >
            <MoreHorizontal size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        <ApHeader title="Habits laid to rest" hasBackButton={false} />

        <Text className="text-[12px] font-semibold text-ink-tertiary my-3">
          {filteredBurials.length} burial{filteredBurials.length !== 1 ? "s" : ""} in the graveyard
        </Text>

        <View className="flex-row gap-2 mb-4">
          <Button
            label="All"
            variant={filter === "all" ? "primary" : "secondary"}
            onPress={() => setFilter("all")}
            className="flex-1"
          />
          <Button
            label="Active"
            variant={filter === "active" ? "primary" : "secondary"}
            onPress={() => setFilter("active")}
            className="flex-1"
          />
          <Button
            label="Restored"
            variant={filter === "restored" ? "primary" : "secondary"}
            onPress={() => setFilter("restored")}
            className="flex-1"
          />
        </View>

        {loading && filteredBurials.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-[14px] text-ink-secondary">Loading graves...</Text>
          </View>
        ) : filteredBurials.length === 0 ? (
          emptyContent
        ) : (
          burialContent
        )}
      </ScrollView>
    </View>
  );
};

export default GraveyardScreen;
