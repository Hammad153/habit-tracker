import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Plus, ArrowLeft } from "lucide-react-native";
import {
  ApEmptyState,
  SkeletonCard,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { ProgressBar } from "@/src/components/ProgressBar";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useIdentitiesState } from "./context";
import { IIdentity } from "./model";
import { getLucideIcon, getCategoryKeyForId } from "@/src/utils/icons";
import { CategoryKey } from "@/src/components/ListRow";

export const IdentityScreen = () => {
  const colors = useTheme();
  const { loading, activeIdentities } = useIdentitiesState();

  const progressFor = (identity: IIdentity) => {
    const points = identity.evidencePoints ?? 0;
    const level = identity.level ?? 1;
    const pct = identity.progressToNextLevel ?? 0;
    return { points, level, pct: Math.min(1, Math.max(0, pct / 100)) };
  };

  const isInitialLoading = loading && activeIdentities.length === 0;

  return (
    <View className="flex-1 bg-background">
      {/* Navigation Bar */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/create-identity")}
          className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Create identity"
        >
          <Plus size={20} color={colors.inkPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Title & Subtitle Header */}
      <View className="px-5 pt-1 pb-3">
        <Text className="text-[26px] font-bold text-ink-primary tracking-tight">
          Identities
        </Text>
        <Text className="text-[13.5px] leading-[19px] text-ink-secondary mt-1">
          Every action is a vote for who you want to become
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {isInitialLoading ? (
          <View className="gap-3">
            <SkeletonCard height={90} />
            <SkeletonCard height={90} />
            <SkeletonCard height={90} />
          </View>
        ) : activeIdentities.length === 0 ? (
          <ApEmptyState
            title="Who do you want to become?"
            description="Create an identity like Runner, then link habits that prove it."
            actionLabel="Create identity"
            onAction={() => router.push("/create-identity")}
          />
        ) : (
          <View className="gap-3">
            {activeIdentities.map((identity) => {
              const { points, level, pct } = progressFor(identity);
              const IconComp = getLucideIcon(identity.icon || "target");
              const catKey: CategoryKey = getCategoryKeyForId(identity.id);
              const catTokens = colors.category[catKey];

              return (
                <Pressable
                  key={identity.id}
                  onPress={() =>
                    router.push({
                      pathname: "/edit-identity",
                      params: { id: identity.id },
                    })
                  }
                >
                  <Card className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View
                          className="w-10 h-10 rounded-md items-center justify-center"
                          style={{ backgroundColor: catTokens.bg }}
                        >
                          <IconComp size={20} color={catTokens.ink} strokeWidth={2} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[15px] font-bold text-ink-primary" numberOfLines={1}>
                            {identity.title}
                          </Text>
                          <Text className="text-[12.5px] font-medium text-ink-secondary">
                            Level {level} · {identity.levelTitle || "Starting"}
                          </Text>
                        </View>
                      </View>
                      <View className="px-2.5 py-1 rounded-pill bg-accent-soft">
                        <Text className="text-[12px] font-bold text-accent">
                          {points} pts
                        </Text>
                      </View>
                    </View>

                    {identity.description ? (
                      <Text className="text-[13.5px] text-ink-secondary mb-3">
                        {identity.description}
                      </Text>
                    ) : null}

                    <ProgressBar progress={pct} tone="accent" height={4} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default IdentityScreen;
