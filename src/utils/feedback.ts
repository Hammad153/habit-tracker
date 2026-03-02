import * as Haptics from "expo-haptics";
import { useSettingsState } from "../modules/settings/context";

export const useFeedback = () => {
  const { soundEnabled, hapticEnabled } = useSettingsState();

  const triggerHaptic = async (
    type:
      | Haptics.ImpactFeedbackStyle
      | Haptics.NotificationFeedbackType = Haptics.ImpactFeedbackStyle.Medium,
  ) => {
    if (!hapticEnabled) return;

    if (Object.values(Haptics.ImpactFeedbackStyle).includes(type as any)) {
      await Haptics.impactAsync(type as Haptics.ImpactFeedbackStyle);
    } else {
      await Haptics.notificationAsync(type as Haptics.NotificationFeedbackType);
    }
  };

  const playSound = async (soundType: "success" | "click" | "error") => {
    if (!soundEnabled) return;

    console.log(`Playing sound: ${soundType}`);
  };

  return { triggerHaptic, playSound };
};
