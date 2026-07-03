export type ThemeMode = "light" | "dark" | "system";

export interface ISettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  themeMode: ThemeMode;
}
