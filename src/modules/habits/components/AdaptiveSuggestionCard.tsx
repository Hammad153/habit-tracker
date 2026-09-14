import React from "react";
import { Pressable, View } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { ApText, ApCard } from "@/src/components";
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
    <ApCard className="p-4 mb-3">
      <View className="flex-row items-center">
        <TrendingUp size={16} color={colors.primary} />
        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 0.8 }}
        >
          Adaptive Insight
        </ApText>
      </View>

      <ApText size="base" font="semibold" color={colors.textPrimary} className="mt-2">
        {headline}
      </ApText>

      {change !== "" && (
        <View
          className="self-start px-2.5 py-1 rounded-full mt-2"
          style={{ backgroundColor: colors.accentLight }}
        >
          <ApText size="xs" font="semibold" color={colors.primary}>
            {change}
          </ApText>
        </View>
      )}

      <ApText size="xs" color={colors.textSecondary} className="mt-2">
        {message}
      </ApText>

      <View className="flex-row gap-3 mt-3.5">
        <Pressable
          onPress={onAccept}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Accept suggestion"
          className="h-9 rounded-full items-center justify-center flex-1"
          style={{ backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }}
        >
          <ApText size="xs" font="semibold" color={colors.background}>
            {busy ? "Applying…" : actionLabel || "Try it"}
          </ApText>
        </Pressable>
        <Pressable
          onPress={onReject}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Keep current habit"
          className="h-9 rounded-full items-center justify-center flex-1 border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText size="xs" font="medium" color={colors.textSecondary}>
            Keep current
          </ApText>
        </Pressable>
      </View>
    </ApCard>
  );
};

export default AdaptiveSuggestionCard;
