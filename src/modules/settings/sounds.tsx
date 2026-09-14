import React from "react";
import { View } from "react-native";
import { Fingerprint, Volume2 } from "lucide-react-native";
import { ApText, ApContainer, ApHeader, ApScrollView, SwitchButton } from "@/src/components";
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
        <View
          className="rounded-2xl border overflow-hidden mb-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          {settings.map((item, index) => {
            const IconComp = item.icon;
            const showBorder = index < settings.length - 1;
            return (
              <View
                key={item.id}
                className="px-4 py-3.5"
                style={{
                  borderBottomWidth: showBorder ? 1 : 0,
                  borderBottomColor: colors.surfaceBorder,
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
                    <View className="flex-1 justify-center">
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
                  <SwitchButton
                    value={item.value}
                    onValueChange={item.onToggle}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default SoundsScreen;
