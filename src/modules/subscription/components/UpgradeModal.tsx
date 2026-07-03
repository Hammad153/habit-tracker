import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ApText, ApModal } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
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

const UpgradeModal = () => {
  const colors = useTheme();
  const { showUpgradeModal, setShowUpgradeModal, subscription, updateSubscription } =
    useSubscriptionState();

  const currentTier = subscription?.tier || SubscriptionTier.FREE;

  const handleUpgrade = (tier: SubscriptionTier) => {
    updateSubscription(tier).then(() => {
      setShowUpgradeModal(false);
    });
  };

  return (
    <ApModal
      visible={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      title="Upgrade Your Plan"
      subTitle="Unlock unlimited habits and premium features"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 450 }}
      >
        {/* Tier Cards */}
        {[SubscriptionTier.BASIC, SubscriptionTier.PREMIUM].map((tier) => {
          const isCurrentTier = currentTier === tier;
          const tierColors = TIER_COLORS[tier];

          return (
            <View key={tier} className="mb-3">
              <LinearGradient
                colors={[tierColors[0] + "20", tierColors[1] + "10"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-4 border"
                style={{
                  borderColor: isCurrentTier
                    ? tierColors[0]
                    : colors.surfaceBorder,
                }}
              >
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name={tier === SubscriptionTier.PREMIUM ? "diamond" : "star"}
                      size={20}
                      color={tierColors[0]}
                    />
                    <ApText
                      size="lg"
                      font="bold"
                      color={tierColors[0]}
                      className="ml-2"
                    >
                      {TIER_LABELS[tier]}
                    </ApText>
                  </View>
                  <ApText size="lg" font="bold" color={colors.textPrimary}>
                    {TIER_PRICES[tier]}
                  </ApText>
                </View>

                {/* Feature pills */}
                <View className="mt-2">
                  {TIER_FEATURES.filter((f) => {
                    const val = tier === SubscriptionTier.BASIC ? f.basic : f.premium;
                    return val === true || typeof val === "string";
                  })
                    .slice(0, 4)
                    .map((feature) => (
                      <View
                        key={feature.name}
                        className="flex-row items-center mb-1"
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={tierColors[0]}
                        />
                        <ApText
                          size="sm"
                          color={colors.textSecondary}
                          className="ml-2"
                        >
                          {feature.name}
                          {typeof (tier === SubscriptionTier.BASIC
                            ? feature.basic
                            : feature.premium) === "string"
                            ? ` (${tier === SubscriptionTier.BASIC ? feature.basic : feature.premium})`
                            : ""}
                        </ApText>
                      </View>
                    ))}
                </View>

                <TouchableOpacity
                  onPress={() => handleUpgrade(tier)}
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
                    {isCurrentTier ? "Current Plan" : `Upgrade to ${TIER_LABELS[tier]}`}
                  </ApText>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          );
        })}

        {/* Habit limit info */}
        {subscription && (
          <View
            className="flex-row items-center justify-center mt-1 mb-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: colors.background }}
          >
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.textMuted}
            />
            <ApText size="xs" color={colors.textMuted} className="ml-2">
              You're using {subscription.currentHabitCount} of{" "}
              {subscription.habitLimit === -1
                ? "unlimited"
                : subscription.habitLimit}{" "}
              habits
            </ApText>
          </View>
        )}
      </ScrollView>
    </ApModal>
  );
};

export default UpgradeModal;
