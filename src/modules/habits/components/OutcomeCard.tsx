import React from "react";
import { View } from "react-native";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react-native";
import { ApText, ApCard } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { IAdaptationOutcomeEntry } from "@/src/modules/habits/adaptive";

const pct = (v: number | null | undefined): string =>
  v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`;

const OutcomeCard: React.FC<{ entry: IAdaptationOutcomeEntry }> = ({ entry }) => {
  const colors = useTheme();
  const isImproved = entry.outcome === "IMPROVED";
  const isWorsened = entry.outcome === "WORSENED";

  const headline = isImproved
    ? "This adjustment helped"
    : isWorsened
      ? "This one got harder"
      : "Holding steady";

  const IconComp = isImproved
    ? ArrowUpRight
    : isWorsened
      ? ArrowDownRight
      : Minus;

  const iconColor = isImproved
    ? colors.primary
    : isWorsened
      ? colors.danger
      : colors.textMuted;

  return (
    <ApCard className="p-4 mt-3">
      <View className="flex-row items-center">
        <IconComp size={16} color={iconColor} />
        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 0.8 }}
        >
          Adjustment Result · {headline}
        </ApText>
      </View>
      <ApText size="sm" color={colors.textPrimary} className="mt-2">
        Completion moved {pct(entry.baselineCompletionRate)} →{" "}
        {pct(entry.postCompletionRate)}.
      </ApText>
    </ApCard>
  );
};

export default OutcomeCard;
