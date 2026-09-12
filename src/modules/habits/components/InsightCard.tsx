import React from "react";
import { Pressable, View } from "react-native";
import { Lightbulb, X } from "lucide-react-native";
import { ApText, ApCard } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import {
  ICoach,
  IIntervention,
  InterventionActionType,
} from "@/src/modules/habits/intervention";

interface InsightCardProps {
  intervention: IIntervention;
  coach?: ICoach | null;
  onViewed?: (fingerprint: string) => void;
  onDismissed?: (fingerprint: string) => void;
  onActionStarted?: (fingerprint: string) => void;
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
    <ApCard className="p-4 mb-3">
      <View className="flex-row items-start">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.accentLight }}
        >
          <Lightbulb size={18} color={colors.primary} />
        </View>
        <View className="flex-1">
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="uppercase"
            style={{ letterSpacing: 0.8 }}
          >
            Coach Insight
          </ApText>
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
          <X size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      {actionable ? (
        <Pressable
          onPress={() => {
            onActionStarted?.(intervention.fingerprint);
            onAction(intervention.suggestedAction.type);
          }}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={action}
          className="mt-3 h-8 rounded-full items-center justify-center self-start px-4"
          style={{ backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }}
        >
          <ApText size="xs" font="semibold" color={colors.background}>
            {busy ? "Saving…" : action}
          </ApText>
        </Pressable>
      ) : null}
    </ApCard>
  );
};

export default InsightCard;
