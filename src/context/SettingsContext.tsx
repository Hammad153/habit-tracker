import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "react-native";
import { ApTheme, LightTheme, DarkTheme } from "../components/theme";

type ThemeMode = "light" | "dark" | "system";

interface SettingsContextType {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeMode: ThemeMode;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof ApTheme.Color;
  isDark: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

const SECURE_STORE_KEYS = {
  SOUND_ENABLED: "settings_sound_enabled",
  HAPTIC_ENABLED: "settings_haptic_enabled",
  THEME_MODE: "settings_theme_mode",
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark"); // Default to dark as per current app style

  useEffect(() => {
    // Load settings from SecureStore
    const loadSettings = async () => {
      try {
        const sound = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.SOUND_ENABLED,
        );
        const haptic = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.HAPTIC_ENABLED,
        );
        const theme = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.THEME_MODE,
        );

        if (sound !== null) setSoundEnabledState(sound === "true");
        if (haptic !== null) setHapticEnabledState(haptic === "true");
        if (theme !== null) setThemeModeState(theme as ThemeMode);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.SOUND_ENABLED,
      String(enabled),
    );
  };

  const setHapticEnabled = async (enabled: boolean) => {
    setHapticEnabledState(enabled);
    await SecureStore.setItemAsync(
      SECURE_STORE_KEYS.HAPTIC_ENABLED,
      String(enabled),
    );
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.THEME_MODE, mode);
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
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const useTheme = () => {
  return useSettings().colors;
};
