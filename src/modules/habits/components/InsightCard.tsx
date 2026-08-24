import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import {
  ICoach,
  IIntervention,
  InterventionActionType,
} from "@/src/modules/habits/intervention";

interface InsightCardProps {
  intervention: IIntervention;
  /** AI-coached wording; absent/failing keeps the deterministic copy. */
  coach?: ICoach | null;
  /** Phase 4.1 ledger callbacks (fire-and-forget inside the parent). */
  onViewed?: (fingerprint: string) => void;
  onDismissed?: (fingerprint: string) => void;
  onActionStarted?: (fingerprint: string) => void;
  /** True while a completion triggered by this card is in flight. */
  busy?: boolean;
  onAction: (action: InterventionActionType) => void;
  onDismiss: () => void;
}

const ACTION_LABELS: Record<InterventionActionType, string> = {
  USE_MINIMUM_VERSION: "Use Minimum Version",
  USE_EMERGENCY_VERSION: "Use Emergency Version",
  OPEN_HABIT_EDIT: "Adjust Habit",
  CONFIGURE_HABIT_STACK: "Set Up Stack",
  REVIEW_ACTIVE_HABITS: "Review Habits",
  NONE: "",
};

/**
 * Phase 3.2 — calm, deterministic habit insight card.
 * Renders the single backend-recommended intervention; never fabricates one.
 */
const InsightCard: React.FC<InsightCardProps> = ({
  intervention,
  coach,
  onViewed,
  onDismissed,
  onActionStarted,
  busy,
  onAction,
  onDismiss,
}) => {
  const colors = useTheme();

  // Phase 4.1 — INTERVENTION_VIEWED fires once per fingerprint on render.
  const viewedFingerprintRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const fp = intervention.fingerprint;
    if (!fp || viewedFingerprintRef.current === fp) return;
    viewedFingerprintRef.current = fp;
    onViewed?.(fp);
  }, [intervention.fingerprint, onViewed]);

  const action =
    (coach?.actionLabel && coach.actionLabel.trim()) ||
    ACTION_LABELS[intervention.suggestedAction.type];
  const actionable =
    intervention.category === "USER_ACTION_REQUIRED" &&
    intervention.suggestedAction.type !== "NONE" &&
    action !== "";

  return (
    <View
      className="rounded-2xl p-4"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-start">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Ionicons name="bulb-outline" size={18} color={colors.primary} />
        </View>
        <View className="ml-3 flex-1">
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="uppercase"
            style={{ letterSpacing: 1 }}
          >
            Your Coach
          </ApText>
          {/* AI headline when available, deterministic title otherwise. */}
          <ApText size="base" font="semibold" color={colors.textPrimary} className="mt-0.5">
            {coach?.headline || intervention.title}
          </ApText>
          <ApText size="xs" color={colors.textSecondary} className="mt-1">
            {coach?.message || intervention.reason}
          </ApText>
        </View>
        <Pressable
          onPress={() => {
            onDismissed?.(intervention.fingerprint);
            onDismiss();
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss insight"
          hitSlop={10}
          className="ml-2"
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      {actionable ? (
        <Pressable
          onPress={() => {
            // INTERVENTION_ACTION_STARTED precedes the real flow; only the
            // server can later record ACTION_COMPLETED after verification.
            onActionStarted?.(intervention.fingerprint);
            onAction(intervention.suggestedAction.type);
          }}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={action}
          className="mt-3 h-9 rounded-full items-center justify-center self-start px-4"
          style={{ backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }}
        >
          <ApText size="xs" font="bold" color={colors.background}>
            {busy ? "Saving…" : action}
          </ApText>
        </Pressable>
      ) : null}
    </View>
  );
};

export default InsightCard;
