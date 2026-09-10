import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";

/**
 * Slim countdown banner shown while the free trial is running. Once the trial
 * ends the server blocks access and ApRouteAuthGuard routes the user to the
 * subscription screen — no local hack can keep them in.
 */
const TrialBanner = () => {
  const colors = useTheme();
  const router = useRouter();
  const { subscription } = useSubscriptionState();

  if (
    !subscription ||
    subscription.tier !== "TRIAL" ||
    subscription.status !== "TRIALING" ||
    subscription.trialDaysLeft == null
  ) {
    return null;
  }

  const days = subscription.trialDaysLeft;

  return (
    <View
      className="mx-4 mt-3 flex-row items-center rounded-2xl border px-4 py-3"
      style={{ backgroundColor: "#8b5cf6" + "18", borderColor: "#8b5cf6" + "40" }}
    >
      <Ionicons name="hourglass-outline" size={18} color="#8b5cf6" />
      <View className="ml-2 flex-1">
        <ApText size="sm" font="semibold" color="#7c3aed">
          {days === 0
            ? "Your free trial ends today"
            : `${days} day${days === 1 ? "" : "s"} left in your free trial`}
        </ApText>
        <ApText size="xs" color={colors.textMuted}>
          Full access on every feature.
        </ApText>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/subscription")}
        className="px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: "#8b5cf6" + "25" }}
        accessibilityRole="button"
        accessibilityLabel="See subscription plans"
      >
        <ApText size="xs" font="bold" color="#7c3aed">
          See plans
        </ApText>
      </TouchableOpacity>
    </View>
  );
};

export default TrialBanner;