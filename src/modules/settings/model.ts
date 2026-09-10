export type ThemeMode = "light" | "dark" | "system" | "golden" | "focus";

export interface ISettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeMode: ThemeMode;
}
