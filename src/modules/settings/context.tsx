import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { colorScheme as nativeWindColorScheme } from "nativewind";
import { ApStorageService, ApStorageKeys } from "@/src/services";
import { LightTheme, DarkTheme, GoldenTheme, FocusTheme, ThemeColors } from "@/src/components/theme";
import { ThemeMode } from "./model";

interface IProps {
  children: React.ReactNode;
}

export type ActiveTheme = "light" | "dark" | "golden" | "focus";

type TSettingsContext = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  themeClass: string;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
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
  const { colors, isDark, activeTheme, themeClass } = useSettingsState();
  return { ...colors, colors, isDark, activeTheme, themeClass };
};

export const SettingsProvider: React.FC<IProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

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
    themeMode === "golden" || themeMode === "focus" || themeMode === "dark"
      ? true
      : themeMode === "system"
      ? systemColorScheme === "dark"
      : false;

  const activeTheme: ActiveTheme =
    themeMode === "golden"
      ? "golden"
      : themeMode === "focus"
      ? "focus"
      : isDark
      ? "dark"
      : "light";

  const themeClass = `theme-${activeTheme}`;

  useEffect(() => {
    try {
      nativeWindColorScheme.set(isDark ? "dark" : "light");
    } catch {
      // NativeWind colorScheme fallback
    }
  }, [isDark]);

  const colors =
    themeMode === "golden"
      ? GoldenTheme
      : themeMode === "focus"
      ? FocusTheme
      : isDark
      ? DarkTheme
      : LightTheme;

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        hapticEnabled,
        themeMode,
        activeTheme,
        themeClass,
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

