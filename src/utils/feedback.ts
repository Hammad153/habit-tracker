import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSettingsState } from "../modules/settings/context";

export const useFeedback = () => {
  const { soundEnabled, hapticEnabled } = useSettingsState();

  const triggerHaptic = (
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
  };

  const playSound = (soundType: "success" | "click" | "error") => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${soundType}`);
  };

  return { triggerHaptic, playSound };
};
