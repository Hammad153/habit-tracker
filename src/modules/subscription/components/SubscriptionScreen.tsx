import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
  ApEmptyState,
} from "@/src/components";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";
import { IPlan, SubscriptionTier, TIER_FEATURES } from "../model";

const TIER_COLORS: Record<SubscriptionTier, string[]> = {
  TRIAL: ["#8b5cf6", "#a78bfa"],
  BASIC: ["#0ea5e9", "#38bdf8"],
  PREMIUM: ["#6366f1", "#8b5cf6"],
};

const intervalLabel = (interval: string | null | undefined) =>
  interval === "YEARLY"
    ? "/year"
    : interval === "MONTHLY"
      ? "/month"
      : "";

const SubscriptionScreen = () => {
  const colors = useTheme();
  const {
    subscription,
    loading,
    plans,
    plansCurrency,
    fetchSubscription,
    fetchPlans,
    startCheckout,
    cancelSubscription,
    resumeSubscription,
  } = useSubscriptionState();

  useEffect(() => {
    fetchSubscription();
    if (plans.length === 0) fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !subscription) {
    return <ApLoader />;
  }

  const tier: SubscriptionTier = subscription?.tier || "TRIAL";
  const tierColors = TIER_COLORS[tier];
  const status = subscription?.status || "TRIALING";
  const trialEnded = Boolean(subscription) && !subscription?.accessGranted;

  const isCurrentPlan = (plan: IPlan) =>
    subscription?.currentPlan === plan.id;

  const CURRENCY = plansCurrency || subscription?.currency || "NGN";

  const formatAmount = (amount: number | null | undefined) =>
    amount == null
      ? ""
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: CURRENCY,
          maximumFractionDigits: 0,
        }).format(amount);

  const handleChoosePlan = async (plan: IPlan) => {
    const ok = await startCheckout(plan.id);
    if (ok) {
      router.back();
    }
  };

  return (
    <ApContainer>
      <ApHeader title="Subscription" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Current plan banner */}
        <View className="px-5 mt-4 mb-6">
          <LinearGradient
            colors={[tierColors[0] + "30", tierColors[1] + "15"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5 border"
            style={{ borderColor: tierColors[0] + "40" }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons
                name={
                  tier === "PREMIUM"
                    ? "diamond"
                    : tier === "BASIC"
                      ? "star"
                      : "hourglass"
                }
                size={24}
                color={tierColors[0]}
              />
              <ApText
                size="xl"
                font="bold"
                color={tierColors[0]}
                className="ml-2"
              >
                {tier === "TRIAL" ? "Free Trial" : `${tier} Plan`}
              </ApText>
            </View>

            {trialEnded ? (
              <ApText size="sm" color={colors.textSecondary}>
                Your trial has ended. Choose a plan below to keep your data and
                continue building your routine.
              </ApText>
            ) : tier === "TRIAL" ? (
              <ApText size="sm" color={colors.textSecondary}>
                {subscription?.trialDaysLeft != null
                  ? `${subscription.trialDaysLeft} day${
                      subscription.trialDaysLeft === 1 ? "" : "s"
                    } left in your free trial — full access to every feature.`
                  : "Full access during your free trial."}
              </ApText>
            ) : (
              <ApText size="sm" color={colors.textSecondary}>
                {status === "NON_RENEWING"
                  ? "Your plan continues until the end of the current period."
                  : status === "PAYMENT_FAILED" || status === "PAST_DUE"
                    ? "We couldn't renew your plan. Update your payment method before the grace period ends."
                    : "Thanks for subscribing!"}{" "}
                {subscription?.currentPeriodEnd
                  ? `Renews ${new Date(
                      subscription.currentPeriodEnd,
                    ).toLocaleDateString()}.`
                  : ""}
              </ApText>
            )}

            {subscription && (
              <View className="flex-row items-center mt-3">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: tierColors[0] + "20",
                  }}
                >
                  <ApText size="xs" font="semibold" color={tierColors[0]}>
                    {subscription.tier === "TRIAL"
                      ? `${subscription.currentHabitCount} habits tracked`
                      : `${formatAmount(subscription.amount)}${
                          subscription.billingInterval
                            ? intervalLabel(subscription.billingInterval)
                            : ""
                        } · ${
                          subscription.cancelAtPeriodEnd
                            ? "cancelling at period end"
                            : "renewing automatically"
                        }`}
                  </ApText>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Plan cards (prices always come from the backend) */}
        <View className="px-5">
          <ApText
            size="sm"
            font="bold"
            color={colors.textMuted}
            className="mb-3 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Choose a Plan
          </ApText>

          {plans.length === 0 ? (
            <ApEmptyState
              icon="cloud-offline-outline"
              title="Plans aren't available yet"
              subtitle="Pull to retry, or check your connection."
              actionLabel="Retry"
              onAction={() => fetchPlans()}
            />
          ) : (
            plans.map((plan) => {
              const current = isCurrentPlan(plan);
              const planColors = TIER_COLORS[plan.tier];
              const features =
                TIER_FEATURES[plan.tier as "BASIC" | "PREMIUM"] ?? [];
              const yearly = plan.billingInterval === "YEARLY";

              return (
                <View
                  key={plan.id}
                  className="mb-4 rounded-2xl border overflow-hidden"
                  style={{
                    borderColor: plan.mostPopular
                      ? planColors[0]
                      : current
                        ? planColors[0]
                        : colors.surfaceBorder,
                    backgroundColor: colors.surface,
                  }}
                >
                  <LinearGradient
                    colors={[planColors[0] + "15", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-4"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Ionicons
                            name={
                              plan.tier === "PREMIUM"
                                ? "diamond"
                                : "star"
                            }
                            size={20}
                            color={planColors[0]}
                          />
                          <ApText
                            size="lg"
                            font="bold"
                            color={colors.textPrimary}
                            className="ml-2"
                          >
                            {plan.displayName}
                            {yearly ? " · Yearly" : " · Monthly"}
                          </ApText>
                        </View>
                        <ApText
                          size="xs"
                          color={colors.textMuted}
                          className="mt-1"
                        >
                          {plan.tagline}
                        </ApText>
                      </View>
                      <View className="items-end">
                        <ApText size="lg" font="bold" color={planColors[0]}>
                          {formatAmount(plan.amount)}
                          <ApText size="sm" color={colors.textMuted}>
                            {intervalLabel(plan.billingInterval)}
                          </ApText>
                        </ApText>
                        {plan.annualSavings ? (
                          <ApText size="xs" color={colors.textSecondary}>
                            Save {formatAmount(plan.annualSavings)}/yr
                          </ApText>
                        ) : null}
                      </View>
                    </View>

                    {plan.mostPopular && !current && (
                      <View
                        className="self-start px-2 py-0.5 rounded-full mb-2"
                        style={{ backgroundColor: planColors[0] + "25" }}
                      >
                        <ApText size="xs" font="semibold" color={planColors[0]}>
                          Most popular
                        </ApText>
                      </View>
                    )}

                    {features.map((feature) => (
                      <View
                        key={feature.label}
                        className="flex-row items-center mb-1.5"
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={planColors[0]}
                        />
                        <ApText
                          size="sm"
                          color={colors.textSecondary}
                          className="ml-2"
                        >
                          {feature.label}
                        </ApText>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={() => handleChoosePlan(plan)}
                      disabled={current || loading}
                      className="mt-3 py-3 rounded-xl items-center"
                      style={{
                        backgroundColor: current
                          ? colors.surfaceInactive
                          : planColors[0],
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <ApText
                        size="sm"
                        font="bold"
                        color={current ? colors.textMuted : "#FFFFFF"}
                      >
                        {current
                          ? "Current Plan"
                          : trialEnded
                            ? "Restore Access"
                            : `Choose ${plan.displayName}`}
                      </ApText>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              );
            })
          )}
        </View>

        {/* Manage current subscription */}
        {(status === "ACTIVE" || status === "NON_RENEWING") && (
          <View className="px-5 mt-2">
            {status === "ACTIVE" ? (
              <TouchableOpacity
                onPress={cancelSubscription}
                disabled={loading}
                className="py-3 rounded-xl items-center border"
                style={{ borderColor: colors.surfaceBorder, opacity: loading ? 0.6 : 1 }}
              >
                <ApText size="sm" font="semibold" color={colors.textMuted}>
                  Cancel future renewal
                </ApText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={resumeSubscription}
                disabled={loading}
                className="py-3 rounded-xl items-center"
                style={{
                  backgroundColor: tierColors[0] + "20",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <ApText size="sm" font="semibold" color={tierColors[0]}>
                  Resume renewal
                </ApText>
              </TouchableOpacity>
            )}
            <ApText
              size="xs"
              color={colors.textMuted}
              className="text-center mt-2 px-4"
            >
              {status === "ACTIVE"
                ? "You keep full access until the end of the current period."
                : "Access continues until the current period ends."}
            </ApText>
          </View>
        )}

        <View className="h-20" />
      </ApScrollView>
    </ApContainer>
  );
};

export default SubscriptionScreen;