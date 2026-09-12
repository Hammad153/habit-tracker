import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Crown, Star } from "lucide-react-native";
import { ApText, ApModal, ApCard, SkeletonCard } from "@/src/components";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";

const intervalLabel = (interval: string | null | undefined) =>
  interval === "YEARLY" ? "/year" : interval === "MONTHLY" ? "/month" : "";

const UpgradeModal = () => {
  const colors = useTheme();
  const {
    showUpgradeModal,
    setShowUpgradeModal,
    subscription,
    plans,
    plansCurrency,
    loading,
    startCheckout,
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
    setShowUpgradeModal(false);
    const ok = await startCheckout(planId);
    if (ok) {
      router.replace("/(tabs)/habits");
    }
  };

  return (
    <ApModal
      visible={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      title="Become a Routina Member"
      subTitle="Choose a plan to continue with unlimited access"
    >
      {loading && plans.length === 0 ? (
        <View className="py-2 gap-3">
          <SkeletonCard style={{ height: 110 }} />
          <SkeletonCard style={{ height: 110 }} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 480 }}
        >
          {plans.map((plan) => {
            const yearly = plan.billingInterval === "YEARLY";
            const isCurrent = subscription?.currentPlan === plan.id;
            const PlanIcon = plan.tier === "PREMIUM" ? Crown : Star;

            return (
              <ApCard key={plan.id} className="mb-3 p-4">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <PlanIcon size={18} color={colors.primary} />
                    <ApText
                      size="base"
                      font="semibold"
                      color={colors.textPrimary}
                      className="ml-2"
                    >
                      {plan.displayName}
                    </ApText>
                  </View>
                  <ApText size="base" font="semibold" color={colors.textPrimary}>
                    {formatAmount(plan.amount)}
                    <ApText size="xs" color={colors.textMuted}>
                      {intervalLabel(plan.billingInterval)}
                    </ApText>
                  </ApText>
                </View>

                <ApText size="xs" color={colors.textMuted} className="mb-3">
                  {plan.tagline}
                  {yearly && plan.annualSavings
                    ? ` · Save ${formatAmount(plan.annualSavings)}/year`
                    : ""}
                </ApText>

                <TouchableOpacity
                  onPress={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loading}
                  className="py-2.5 rounded-xl items-center"
                  style={{
                    backgroundColor: isCurrent
                      ? colors.surfaceInactive
                      : colors.primary,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <ApText
                    size="xs"
                    font="semibold"
                    color={isCurrent ? colors.textMuted : colors.background}
                  >
                    {isCurrent ? "Current Plan" : `Choose ${plan.displayName}`}
                  </ApText>
                </TouchableOpacity>
              </ApCard>
            );
          })}

          <ApText
            size="xs"
            color={colors.textMuted}
            className="text-center mt-1 mb-2 px-4"
          >
            Secure payments by Paystack. Cancel anytime — your data stays with you.
          </ApText>
        </ScrollView>
      )}
    </ApModal>
  );
};

export default UpgradeModal;
