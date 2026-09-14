import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Crown, Star, Hourglass, Check } from "lucide-react-native";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApEmptyState,
  ApCard,
  Skeleton,
  SkeletonCard,
} from "@/src/components";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";
import { IPlan, SubscriptionTier, TIER_FEATURES } from "../model";

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

  const tier: SubscriptionTier = subscription?.tier || "TRIAL";
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

  const TierIcon = tier === "PREMIUM" ? Crown : tier === "BASIC" ? Star : Hourglass;

  return (
    <ApContainer>
      <ApHeader title="Subscription" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {loading && !subscription ? (
          <View className="mt-2 mb-6">
            <SkeletonCard style={{ height: 130, marginBottom: 24 }} />
            <Skeleton width="40%" height={20} style={{ marginBottom: 12 }} />
            <SkeletonCard style={{ height: 120, marginBottom: 12 }} />
            <SkeletonCard style={{ height: 120 }} />
          </View>
        ) : (
          <>
            {/* Current plan banner */}
            <View className="mt-2 mb-6">
              <ApCard className="p-5">
            <View className="flex-row items-center mb-2">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: colors.accentLight }}
              >
                <TierIcon size={20} color={colors.primary} />
              </View>
              <ApText size="lg" font="semibold" color={colors.textPrimary}>
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
                  style={{ backgroundColor: colors.accentLight }}
                >
                  <ApText size="xs" font="medium" color={colors.primary}>
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
          </ApCard>
        </View>

        {/* Plan cards */}
        <View>
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="mb-3 uppercase"
            style={{ letterSpacing: 0.8 }}
          >
            Choose a Plan
          </ApText>

          {plans.length === 0 ? (
            <ApEmptyState
              title="Plans aren't available yet"
              subtitle="Pull to retry, or check your connection."
              actionLabel="Retry"
              onAction={() => fetchPlans()}
            />
          ) : (
            plans.map((plan) => {
              const current = isCurrentPlan(plan);
              const features =
                TIER_FEATURES[plan.tier as "BASIC" | "PREMIUM"] ?? [];
              const yearly = plan.billingInterval === "YEARLY";
              const PlanIcon = plan.tier === "PREMIUM" ? Crown : Star;

              return (
                <ApCard
                  key={plan.id}
                  className="mb-4 p-4"
                  style={{
                    borderColor: plan.mostPopular || current
                      ? colors.primary
                      : colors.surfaceBorder,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center">
                        <PlanIcon size={18} color={colors.primary} />
                        <ApText
                          size="base"
                          font="semibold"
                          color={colors.textPrimary}
                          className="ml-2"
                        >
                          {plan.displayName}
                          {yearly ? " · Yearly" : " · Monthly"}
                        </ApText>
                      </View>
                      <ApText size="xs" color={colors.textMuted} className="mt-1">
                        {plan.tagline}
                      </ApText>
                    </View>
                    <View className="items-end">
                      <ApText size="base" font="semibold" color={colors.primary}>
                        {formatAmount(plan.amount)}
                        <ApText size="xs" color={colors.textMuted}>
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
                      className="self-start px-2 py-0.5 rounded-full mb-3"
                      style={{ backgroundColor: colors.accentLight }}
                    >
                      <ApText size="xs" font="medium" color={colors.primary}>
                        Most popular
                      </ApText>
                    </View>
                  )}

                  {features.map((feature) => (
                    <View key={feature.label} className="flex-row items-center mb-1.5">
                      <Check size={14} color={colors.primary} />
                      <ApText size="xs" color={colors.textSecondary} className="ml-2">
                        {feature.label}
                      </ApText>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => handleChoosePlan(plan)}
                    disabled={current || loading}
                    className="mt-3 py-2.5 rounded-xl items-center"
                    style={{
                      backgroundColor: current
                        ? colors.surfaceInactive
                        : colors.primary,
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    <ApText
                      size="sm"
                      font="semibold"
                      color={current ? colors.textMuted : colors.background}
                    >
                      {current
                        ? "Current Plan"
                        : trialEnded
                          ? "Restore Access"
                          : `Choose ${plan.displayName}`}
                    </ApText>
                  </TouchableOpacity>
                </ApCard>
              );
            })
          )}
        </View>

        {/* Manage current subscription */}
        {(status === "ACTIVE" || status === "NON_RENEWING") && (
          <View className="mt-2">
            {status === "ACTIVE" ? (
              <TouchableOpacity
                onPress={cancelSubscription}
                disabled={loading}
                className="py-3 rounded-xl items-center border"
                style={{ borderColor: colors.surfaceBorder, opacity: loading ? 0.6 : 1 }}
              >
                <ApText size="sm" font="medium" color={colors.textMuted}>
                  Cancel future renewal
                </ApText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={resumeSubscription}
                disabled={loading}
                className="py-3 rounded-xl items-center"
                style={{
                  backgroundColor: colors.accentLight,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <ApText size="sm" font="medium" color={colors.primary}>
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
      </>
    )}
  </ApScrollView>
    </ApContainer>
  );
};

export default SubscriptionScreen;
