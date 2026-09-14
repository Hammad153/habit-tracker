import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { X, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";
import { useSubscriptionState } from "../context";

export const TrialBanner = () => {
  const colors = useTheme();
  const router = useRouter();
  const { subscription } = useSubscriptionState();
  const [dismissed, setDismissed] = useState(false);

  if (
    dismissed ||
    !subscription ||
    subscription.tier !== "TRIAL" ||
    subscription.status !== "TRIALING" ||
    subscription.trialDaysLeft == null
  ) {
    return null;
  }

  const days = subscription.trialDaysLeft;

  return (
    <View className="flex-row items-center justify-between py-2 px-3 my-1 rounded-pill bg-background-surface">
      <Pressable
        onPress={() => router.push("/subscription")}
        className="flex-1 flex-row items-center mr-2"
      >
        <Text className="text-[12px] font-medium text-ink-secondary" numberOfLines={1}>
          {days === 0
            ? "Your free trial ends today · "
            : `${days} day${days === 1 ? "" : "s"} left in trial · `}
          <Text className="font-semibold text-accent">See plans</Text>
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setDismissed(true)}
        hitSlop={8}
        className="w-6 h-6 rounded-pill items-center justify-center active:opacity-60"
      >
        <X size={14} color={colors.inkTertiary} strokeWidth={2} />
      </Pressable>
    </View>
  );
};

export default TrialBanner;
