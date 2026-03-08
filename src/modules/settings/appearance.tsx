import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableRipple, RadioButton } from "react-native-paper";
import { ApText, ApContainer, ApHeader, ApScrollView } from "@/src/components";
import { useSettingsState } from "./context";

const AppearanceScreen = () => {
  const { themeMode, setThemeMode, colors } = useSettingsState();

  const themes = [
    { id: "light", label: "Light", icon: "sunny" },
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "system", label: "System", icon: "settings" },
  ];

  return (
    <ApContainer className="flex-1">
      <ApHeader title="Appearance" hasBackButton />
      <ApScrollView className="flex-1 px-5 pt-6">
        <ApText
          size="sm"
          color={colors.textMuted}
          className="mb-4 uppercase"
          font="bold"
        >
          Theme Mode
        </ApText>
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: colors.surface }}
        >
          {themes.map((theme, index) => (
            <TouchableRipple
              key={theme.id}
              onPress={() => setThemeMode(theme.id as any)}
              rippleColor={colors.primary + "20"}
            >
              <View
                className={`flex-row items-center justify-between p-4 ${
                  index !== themes.length - 1 ? "border-b" : ""
                }`}
                style={{ borderBottomColor: colors.surfaceBorder }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons
                      name={theme.icon as any}
                      size={20}
                      color={
                        themeMode === theme.id
                          ? colors.primary
                          : colors.textMuted
                      }
                    />
                  </View>
                  <ApText
                    size="base"
                    color={
                      themeMode === theme.id
                        ? colors.primary
                        : colors.textSecondary
                    }
                    font={themeMode === theme.id ? "bold" : "medium"}
                  >
                    {theme.label}
                  </ApText>
                </View>
                <RadioButton
                  value={theme.id}
                  status={themeMode === theme.id ? "checked" : "unchecked"}
                  onPress={() => setThemeMode(theme.id as any)}
                  color={colors.primary}
                  uncheckedColor={colors.textMuted}
                />
              </View>
            </TouchableRipple>
          ))}
        </View>
        <ApText size="xs" color={colors.textMuted} className="mt-4 px-2">
          System mode will automatically switch between light and dark themes
          based on your device settings.
        </ApText>
      </ApScrollView>
    </ApContainer>
  );
};

export default AppearanceScreen;
