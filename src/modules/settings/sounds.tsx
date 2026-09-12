import React from "react";
import { View, Switch } from "react-native";
import { Fingerprint, Volume2 } from "lucide-react-native";
import { ApText, ApContainer, ApHeader, ApCard, ApScrollView } from "@/src/components";
import { useSettingsState } from "./context";

const SoundsScreen = () => {
  const {
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    colors,
  } = useSettingsState();

  const settings = [
    {
      id: "haptic",
      label: "Haptic Feedback",
      icon: Fingerprint,
      value: hapticEnabled,
      onToggle: setHapticEnabled,
      description:
        "Vibrate when completing habits or interacting with the app.",
    },
    {
      id: "sound",
      label: "Sound Effects",
      icon: Volume2,
      value: soundEnabled,
      onToggle: setSoundEnabled,
      description:
        "Play sounds when completing goals or receiving notifications.",
    },
  ];

  return (
    <ApContainer>
      <ApHeader title="Sounds & Haptics" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ApText
          size="xs"
          color={colors.textMuted}
          className="mb-2 uppercase"
          font="semibold"
          style={{ letterSpacing: 0.8 }}
        >
          Feedback
        </ApText>
        <ApCard className="overflow-hidden mb-4">
          {settings.map((item, index) => {
            const IconComp = item.icon;
            return (
              <View
                key={item.id}
                className="p-4"
                style={{
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: colors.surfaceBorder,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: colors.accentLight }}
                    >
                      <IconComp size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <ApText
                        size="sm"
                        color={colors.textPrimary}
                        font="medium"
                      >
                        {item.label}
                      </ApText>
                      <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                        {item.description}
                      </ApText>
                    </View>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{
                      false: colors.surfaceInactive,
                      true: colors.primary,
                    }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>
            );
          })}
        </ApCard>
      </ApScrollView>
    </ApContainer>
  );
};

export default SoundsScreen;
