import React, { useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";
import {
  SubscriptionTier,
  TIER_LABELS,
  TIER_PRICES,
  TIER_FEATURES,
} from "../model";

const TIER_COLORS: Record<SubscriptionTier, string[]> = {
  [SubscriptionTier.FREE]: ["#6b7280", "#9ca3af"],
  [SubscriptionTier.BASIC]: ["#0ea5e9", "#38bdf8"],
  [SubscriptionTier.PREMIUM]: ["#8b5cf6", "#a78bfa"],
};

const SubscriptionScreen = () => {
  const { colors } = useSettingsState();
  const { subscription, loading, fetchSubscription, updateSubscription } =
    useSubscriptionState();

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (loading) {
    return <ApLoader />;
  }

  const currentTier = subscription?.tier || SubscriptionTier.FREE;

  const tiers = [
    SubscriptionTier.FREE,
    SubscriptionTier.BASIC,
    SubscriptionTier.PREMIUM,
  ];

  return (
    <ApContainer>
      <ApHeader title="Subscription" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Current plan banner */}
        <View className="px-5 mt-4 mb-6">
          <LinearGradient
            colors={[
              TIER_COLORS[currentTier][0] + "30",
              TIER_COLORS[currentTier][1] + "15",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5 border"
            style={{ borderColor: TIER_COLORS[currentTier][0] + "40" }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons
                name={
                  currentTier === SubscriptionTier.PREMIUM
                    ? "diamond"
                    : currentTier === SubscriptionTier.BASIC
                      ? "star"
                      : "person"
                }
                size={24}
                color={TIER_COLORS[currentTier][0]}
              />
              <ApText
                size="xl"
                font="bold"
                color={TIER_COLORS[currentTier][0]}
                className="ml-2"
              >
                {TIER_LABELS[currentTier]} Plan
              </ApText>
            </View>
            <ApText size="sm" color={colors.textSecondary}>
              {currentTier === SubscriptionTier.FREE
                ? "Upgrade to unlock unlimited habits and premium features"
                : `You're enjoying ${TIER_LABELS[currentTier]} features`}
            </ApText>
            {subscription && (
              <View className="flex-row items-center mt-3">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: TIER_COLORS[currentTier][0] + "20",
                  }}
                >
                  <ApText
                    size="xs"
                    font="semibold"
                    color={TIER_COLORS[currentTier][0]}
                  >
                    {subscription.currentHabitCount}/
                    {subscription.habitLimit === -1
                      ? "∞"
                      : subscription.habitLimit}{" "}
                    habits
                  </ApText>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Tier cards */}
        <View className="px-5">
          <ApText
            size="sm"
            font="bold"
            color={colors.textMuted}
            className="mb-3 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Available Plans
          </ApText>

          {tiers.map((tier) => {
            const isCurrentTier = currentTier === tier;
            const tierColors = TIER_COLORS[tier];

            return (
              <View
                key={tier}
                className="mb-4 rounded-2xl border overflow-hidden"
                style={{
                  borderColor: isCurrentTier
                    ? tierColors[0]
                    : colors.surfaceBorder,
                  backgroundColor: colors.surface,
                }}
              >
                <LinearGradient
                  colors={[tierColors[0] + "15", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4"
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={
                          tier === SubscriptionTier.PREMIUM
                            ? "diamond"
                            : tier === SubscriptionTier.BASIC
                              ? "star"
                              : "person"
                        }
                        size={20}
                        color={tierColors[0]}
                      />
                      <ApText
                        size="lg"
                        font="bold"
                        color={colors.textPrimary}
                        className="ml-2"
                      >
                        {TIER_LABELS[tier]}
                      </ApText>
                    </View>
                    <ApText size="lg" font="bold" color={tierColors[0]}>
                      {TIER_PRICES[tier]}
                    </ApText>
                  </View>

                  {/* Features */}
                  {TIER_FEATURES.map((feature) => {
                    const val =
                      tier === SubscriptionTier.FREE
                        ? feature.free
                        : tier === SubscriptionTier.BASIC
                          ? feature.basic
                          : feature.premium;
                    const isAvailable = val === true || typeof val === "string";

                    return (
                      <View
                        key={feature.name}
                        className="flex-row items-center mb-2"
                      >
                        <Ionicons
                          name={
                            isAvailable
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={18}
                          color={
                            isAvailable ? tierColors[0] : colors.textMuted + "60"
                          }
                        />
                        <ApText
                          size="sm"
                          color={
                            isAvailable
                              ? colors.textSecondary
                              : colors.textMuted + "60"
                          }
                          className="ml-2"
                        >
                          {feature.name}
                          {typeof val === "string" ? ` (${val})` : ""}
                        </ApText>
                      </View>
                    );
                  })}

                  {/* Action button */}
                  <TouchableOpacity
                    onPress={() => updateSubscription(tier)}
                    disabled={isCurrentTier}
                    className="mt-3 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: isCurrentTier
                        ? colors.surfaceInactive
                        : tierColors[0],
                    }}
                  >
                    <ApText
                      size="sm"
                      font="bold"
                      color={isCurrentTier ? colors.textMuted : "#FFFFFF"}
                    >
                      {isCurrentTier
                        ? "Current Plan"
                        : tier === SubscriptionTier.FREE
                          ? "Downgrade"
                          : `Upgrade to ${TIER_LABELS[tier]}`}
                    </ApText>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })}
        </View>

        <View className="h-20" />
      </ApScrollView>
    </ApContainer>
  );
};

export default SubscriptionScreen;
