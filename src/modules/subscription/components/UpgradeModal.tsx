import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ApText, ApModal, ApLoader } from "@/src/components";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";
import { SubscriptionTier } from "../model";

const TIER_COLORS: Record<SubscriptionTier, string[]> = {
  TRIAL: ["#8b5cf6", "#a78bfa"],
  BASIC: ["#0ea5e9", "#38bdf8"],
  PREMIUM: ["#6366f1", "#8b5cf6"],
};

const intervalLabel = (interval: string | null | undefined) =>
  interval === "YEARLY" ? "/year" : interval === "MONTHLY" ? "/month" : "";

/**
 * Quick-pick upgrade sheet used when a paywall trips in the app. Prices are
 * rendered from GET /subscription/plans (never hardcoded).
 */
const UpgradeModal = () => {
  const colors = useTheme();
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    subscription,
    plans,
    plansCurrency,
    startCheckout,
    loading,
  } = useSubscriptionState();

  const CURRENCY = plansCurrency || subscription?.currency || "NGN";
  const formatAmount = (amount: number | null | undefined) =>
    amount == null
      ? ""
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: CURRENCY,
          maximumFractionDigits: 0,
        }).format(amount);

  const handleUpgrade = async (planId: string) => {
    const ok = await startCheckout(planId);
    if (ok) {
      setShowUpgradeModal(false);
      router.back();
    }
  };

  return (
    <ApModal
      visible={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      title="Become a Routina member"
      subTitle="Choose a plan to continue using Routina with unlimited access"
    >
      {loading && plans.length === 0 ? (
        <ApLoader />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 480 }}
        >
          {plans.map((plan) => {
            const tier = plan.tier as SubscriptionTier;
            const tierColors = TIER_COLORS[tier];
            const yearly = plan.billingInterval === "YEARLY";
            const isCurrent = subscription?.currentPlan === plan.id;

            return (
              <View key={plan.id} className="mb-3">
                <LinearGradient
                  colors={[tierColors[0] + "20", tierColors[1] + "10"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    borderColor: plan.mostPopular
                      ? tierColors[0]
                      : colors.surfaceBorder,
                  }}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={tier === "PREMIUM" ? "diamond" : "star"}
                        size={20}
                        color={tierColors[0]}
                      />
                      <ApText
                        size="lg"
                        font="bold"
                        color={tierColors[0]}
                        className="ml-2"
                      >
                        {plan.displayName}
                      </ApText>
                    </View>
                    <ApText size="lg" font="bold" color={colors.textPrimary}>
                      {formatAmount(plan.amount)}
                      <ApText size="xs" color={colors.textMuted}>
                        {intervalLabel(plan.billingInterval)}
                      </ApText>
                    </ApText>
                  </View>

                  <ApText size="xs" color={colors.textMuted} className="mb-2">
                    {plan.tagline}
                    {yearly && plan.annualSavings
                      ? ` · Save ${formatAmount(plan.annualSavings)}/year`
                      : ""}
                  </ApText>

                  <TouchableOpacity
                    onPress={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || loading}
                    className="mt-1 py-3 rounded-xl items-center"
                    style={{
                      backgroundColor: isCurrent
                        ? colors.surfaceInactive
                        : tierColors[0],
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <ApText
                      size="sm"
                      font="bold"
                      color={isCurrent ? colors.textMuted : "#FFFFFF"}
                    >
                      {isCurrent ? "Current Plan" : `Choose ${plan.displayName}`}
                    </ApText>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            );
          })}

          <ApText
            size="xs"
            color={colors.textMuted}
            className="text-center mt-1 mb-2 px-4"
          >
            Secure payments by Paystack. Cancel anytime — your data stays with
            you.
          </ApText>
        </ScrollView>
      )}
    </ApModal>
  );
};

export default UpgradeModal;