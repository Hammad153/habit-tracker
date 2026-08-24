import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { IAdaptationOutcomeEntry } from "@/src/modules/habits/adaptive";

const pct = (v: number | null | undefined): string =>
  v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`;

const TONE: Record<string, { icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap; color: "success" | "warning" | "textSecondary" }> = {
  IMPROVED: { icon: "arrow-up-circle", color: "success" },
  WORSENED: { icon: "arrow-down-circle", color: "warning" },
  UNCHANGED: { icon: "remove-circle-outline", color: "textSecondary" },
};

/**
 * Phase 3.6 — measured adjustment result.
 * All numbers come verbatim from the deterministic backend evaluation.
 */
const OutcomeCard: React.FC<{ entry: IAdaptationOutcomeEntry }> = ({ entry }) => {
  const colors = useTheme();
  const tone = TONE[entry.outcome] ?? TONE.UNCHANGED;
  const headline =
    entry.outcome === "IMPROVED"
      ? "This adjustment helped"
      : entry.outcome === "WORSENED"
        ? "This one got harder"
        : "Holding steady";

  return (
    <View
      className="rounded-2xl p-4 mt-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={tone.icon as never}
          size={16}
          color={
            tone.color === "success"
              ? colors.success
              : tone.color === "warning"
                ? colors.warning
                : colors.textMuted
          }
        />
        <ApText
          size="xs"
          font="bold"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 1 }}
        >
          Adjustment Result · {headline}
        </ApText>
      </View>
      <ApText size="sm" color={colors.textPrimary} className="mt-2">
        Completion moved {pct(entry.baselineCompletionRate)} →{" "}
        {pct(entry.postCompletionRate)}. You&apos;re building consistency by measuring
        what works.
      </ApText>
    </View>
  );
};

export default OutcomeCard;
