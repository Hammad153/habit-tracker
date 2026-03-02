import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { ApStorageService, ApStorageKeys } from "@/src/services";
import { ApTheme, LightTheme, DarkTheme } from "@/src/components/theme";
import { ThemeMode } from "./model";

interface IProps {
  children: React.ReactNode;
}

type TSettingsContext = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeMode: ThemeMode;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof ApTheme.Color;
  isDark: boolean;
};

export const SettingsContext = createContext<TSettingsContext | undefined>(
  undefined,
);

export const useSettingsState = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsState must be used within the SettingsProvider",
    );
  }
  return context;
};

export const useTheme = () => {
  const { colors, isDark } = useSettingsState();
  return { ...colors, isDark };
};

export const SettingsProvider: React.FC<IProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    ApStorageService.getRawItemAsync(ApStorageKeys.SoundEnabled)
      .then((sound) => {
        if (sound !== null) setSoundEnabledState(sound === "true");
        return ApStorageService.getRawItemAsync(ApStorageKeys.HapticEnabled);
      })
      .then((haptic) => {
        if (haptic !== null) setHapticEnabledState(haptic === "true");
        return ApStorageService.getRawItemAsync(ApStorageKeys.ThemeMode);
      })
      .then((theme) => {
        if (theme !== null) setThemeModeState(theme as ThemeMode);
      })
      .catch((error) => {
        console.error("Error loading settings:", error);
      });
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    ApStorageService.setItemAsync(ApStorageKeys.SoundEnabled, String(enabled));
  };

  const setHapticEnabled = (enabled: boolean) => {
    setHapticEnabledState(enabled);
    ApStorageService.setItemAsync(ApStorageKeys.HapticEnabled, String(enabled));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    ApStorageService.setItemAsync(ApStorageKeys.ThemeMode, mode);
  };

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";
  const colors = isDark ? DarkTheme : LightTheme;

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        hapticEnabled,
        themeMode,
        setSoundEnabled,
        setHapticEnabled,
        setThemeMode,
        colors,
        isDark,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
