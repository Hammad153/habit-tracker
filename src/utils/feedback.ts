import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSettingsState } from "../modules/settings/context";
import { useCallback } from "react";

export const useFeedback = () => {
  const { soundEnabled, hapticEnabled } = useSettingsState();

  const triggerHaptic = useCallback(
    (
      type:
        | Haptics.ImpactFeedbackStyle
        | Haptics.NotificationFeedbackType = Haptics.ImpactFeedbackStyle.Medium,
    ) => {
      if (!hapticEnabled || Platform.OS === "web") return;

      if (Object.values(Haptics.ImpactFeedbackStyle).includes(type as any)) {
        Haptics.impactAsync(type as Haptics.ImpactFeedbackStyle);
      } else {
        Haptics.notificationAsync(type as Haptics.NotificationFeedbackType);
      }
    },
    [hapticEnabled],
  );

  /** Light selection haptic — ideal for pickers, color/icon selection */
  const triggerSelection = useCallback(() => {
    if (!hapticEnabled || Platform.OS === "web") return;
    Haptics.selectionAsync();
  }, [hapticEnabled]);

  /** Convenience: haptic + optional sound for success actions */
  const triggerSuccess = useCallback(() => {
    triggerHaptic(Haptics.NotificationFeedbackType.Success);
  }, [triggerHaptic]);

  /** Convenience: selection haptic for clicks/taps */
  const triggerClick = useCallback(() => {
    triggerSelection();
  }, [triggerSelection]);

  /** Convenience: error haptic for validation failures */
  const triggerError = useCallback(() => {
    triggerHaptic(Haptics.NotificationFeedbackType.Error);
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSelection,
    triggerSuccess,
    triggerClick,
    triggerError,
  };
};
