import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ArrowLeft, RotateCcw, Share2 } from "lucide-react-native";
import { router } from "expo-router";
import { ApConfirmModal } from "@/src/components/ConfirmModal";
import { ApHeader } from "@/src/components/Header";
import { Button } from "@/src/components/buttons/Button";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { lifespanLabel } from "@/src/modules/habits/epitaph";
import { format } from "date-fns";

interface TombstoneDetailProps {
  burialId: string;
}

export const TombstoneDetail: React.FC<TombstoneDetailProps> = ({
  burialId,
}) => {
  const colors = useTheme();
  const { burials, restoreBurial, restartBurial } = useHabitState();
  const [burial, setBurial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const found = burials.find((b) => b.id === burialId);
    setBurial(found ?? null);
    setLoading(false);
  }, [burials, burialId]);

  const handleRestore = useCallback(() => {
    if (!burial) return;
    restoreBurial(burial.id);
    setShowRestoreModal(false);
  }, [burial, restoreBurial]);

  const handleRestart = useCallback(() => {
    if (!burial) return;
    restartBurial(burial.id);
    setShowRestartModal(false);
  }, [burial, restartBurial]);

  const lifespanDays = useMemo(() => {
    if (!burial) return 0;
    const created = new Date(burial.habitCreatedAt);
    const buried = new Date(burial.buriedAt);
    return Math.max(1, Math.round((buried.getTime() - created.getTime()) / 86_400_000));
  }, [burial]);

  if (loading || !burial) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }}
      >
        <View className="h-[56px] px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center"
          >
            <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        </View>
        <View className="space-y-2">
          <View className="h-8 w-24 rounded bg-background-surface2" />
          <View className="h-6 w-48 rounded bg-background-surface2" />
          <View className="h-4 w-64 rounded bg-background-surface2" />
        </View>
      </ScrollView>
    );
  }

  const buried = new Date(burial.buriedAt);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }}
    >
      <View className="h-[56px] px-5 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      <ApHeader title="Tombstone" hasBackButton={false} />

      <View className="w-full max-w-[300px] mx-auto mb-6">
        <View
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            backgroundColor: "#E8E4DF",
            borderWidth: 1,
            borderColor: "#C7C2B9",
          }}
        >
          <View className="absolute top-4 left-4">
            <Text className="text-[10px] font-bold text-uppercase opacity-60">
              RIP
            </Text>
          </View>
          <Text className="text-[20px] font-bold mb-1">{burial.title}</Text>
          <Text className="text-[12px] font-medium opacity-70">
            {format(buried, "MMM d, yyyy")}
          </Text>
          <View className="my-4">
            <Text className="text-[14px] font-bold">{lifespanLabel(lifespanDays)}</Text>
            <Text className="text-[11px] opacity-60">Lifespan</Text>
          </View>
          <View className="flex-row justify-center gap-2 mb-4">
            <View className="w-6 h-6 rounded-full bg-background-surface2" />
            <Text className="text-[11px] font-medium opacity-60">
              {burial.totalCompletions} completions
            </Text>
            <Text className="text-[11px] font-medium opacity-60">
              {burial.bestStreak} best streak
            </Text>
          </View>
            <Text
              className="text-[13px] leading-[20px] italic"
              style={{ color: colors.inkPrimary }}
            >
              {'"' + burial.epitaph + '"'}
            </Text>
          {burial.reason && (
            <View className="mt-4 pt-4 border-t border-border">
              <Text className="text-[11px] font-medium" style={{ color: colors.inkTertiary }}>
                Reason: {burial.reason}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row gap-2">
        <Button
          label="Restore Habit"
          onPress={() => setShowRestoreModal(true)}
          variant="secondary"
          className="flex-1"
        />
        <Button
          label="Restart"
          onPress={() => setShowRestartModal(true)}
          variant="secondary"
          className="flex-1"
          icon={<RotateCcw size={16} strokeWidth={2} />}
        />
      </View>

      <View className="mt-3">
        <Button
          label="Share Tombstone"
          onPress={() => {
            void router.push(`/share-tombstone/${burial.id}` as never);
          }}
          variant="secondary"
          className="w-full"
          icon={<Share2 size={16} strokeWidth={2} />}
        />
      </View>

      <ApConfirmModal
        visible={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestore}
        title="Restore Habit"
        description="This will reactivate the habit and restore its reminder. Completion history will be preserved."
        confirmText="Restore"
        cancelText="Cancel"
      />

      <ApConfirmModal
        visible={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        onConfirm={handleRestart}
        title="Restart as New Attempt"
        description="This creates a new habit with the same settings. The original tombstone remains in the graveyard."
        confirmText="Restart"
        cancelText="Cancel"
      />

      <ApConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {}}
        title="Remove Tombstone"
        description="This permanently deletes the burial record. This cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive
      />
    </ScrollView>
  );
};

export default TombstoneDetail;
