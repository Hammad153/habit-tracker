import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import {
  IAdaptiveSuggestion,
  describeProposal,
} from "@/src/modules/habits/adaptive";

interface AdaptiveCardProps {
  suggestion: IAdaptiveSuggestion;
  headline: string;
  message: string;
  actionLabel?: string;
  unit?: string | null;
  busy?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

/**
 * Phase 3.5 — adaptive insight card.
 * Values come from the deterministic engine; the user decides.
 */
const AdaptiveSuggestionCard: React.FC<AdaptiveCardProps> = ({
  suggestion,
  headline,
  message,
  actionLabel,
  unit,
  busy,
  onAccept,
  onReject,
}) => {
  const colors = useTheme();
  const change = describeProposal(
    suggestion.current,
    suggestion.proposed,
    unit,
  );

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary + "40",
      }}
    >
      <View className="flex-row items-center">
        <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
        <ApText
          size="xs"
          font="bold"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 1 }}
        >
          Adaptive Insight
        </ApText>
      </View>

      <ApText size="base" font="semibold" color={colors.textPrimary} className="mt-2">
        {headline}
      </ApText>

      {change !== "" && (
        <View
          className="self-start px-3 py-1.5 rounded-xl mt-2"
          style={{ backgroundColor: colors.primary + "14" }}
        >
          <ApText size="sm" font="bold" color={colors.primary}>
            {change}
          </ApText>
        </View>
      )}

      <ApText size="xs" color={colors.textSecondary} className="mt-2">
        {message}
      </ApText>

      <View className="flex-row gap-3 mt-3">
        <Pressable
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Accept suggestion"
          className="h-9 rounded-full items-center justify-center flex-1"
          style={{ backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }}
        >
          <ApText size="xs" font="bold" color={colors.background}>
            {busy ? "Applying…" : actionLabel || "Try it"}
          </ApText>
        </Pressable>
        <Pressable
          onPress={onReject}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Keep current habit"
          className="h-9 rounded-full items-center justify-center flex-1"
          style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.surfaceBorder }}
        >
          <ApText size="xs" font="semibold" color={colors.textSecondary}>
            Keep current
          </ApText>
        </Pressable>
      </View>
    </View>
  );
};

export default AdaptiveSuggestionCard;
