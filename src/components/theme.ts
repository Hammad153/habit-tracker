export const DesignTokens = {
  background: {
    DEFAULT: "#FFFFFF",
    surface: "#F6F6F2",
    surface2: "#EFEFE9",
    elevated: "#FFFFFF",
    inverse: "#131311",
    overlay: "rgba(19, 19, 17, 0.45)",
    tabBarActive: "rgba(255, 255, 255, 0.12)",
  },
  ink: {
    primary: "#131311",
    secondary: "#55554F",
    tertiary: "#9A9A93",
    inverse: "#FFFFFF",
    disabled: "#C7C7C0",
  },
  border: {
    DEFAULT: "#E7E7E0",
    strong: "#D6D6CE",
    focus: "#2B6A4D",
  },
  accent: {
    DEFAULT: "#2B6A4D",
    soft: "#E4EEE8",
    strong: "#1F4F39",
  },
  heatmap: {
    light: "#C4DEC9",
    mid: "#72B286",
  },
  success: {
    DEFAULT: "#2B6A4D",
    soft: "#E4EEE8",
  },
  warning: {
    DEFAULT: "#B8842B",
    soft: "#FBF2E1",
  },
  danger: {
    DEFAULT: "#C4432E",
    soft: "#FBEAE6",
  },
  category: {
    rose: { bg: "#F7DEE4", ink: "#C24A70" },
    amber: { bg: "#FBE4D2", ink: "#D07A2E" },
    mint: { bg: "#D9F0E8", ink: "#1E8F76" },
    violet: { bg: "#E7E1F8", ink: "#7259C9" },
    sky: { bg: "#DEEAF7", ink: "#3373B8" },
    sand: { bg: "#F2EBDD", ink: "#93773D" },
  },
  elevation: {
    0: { shadowColor: "transparent", shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    1: {
      shadowColor: "#131311",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    2: {
      shadowColor: "#131311",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    3: {
      shadowColor: "#131311",
      shadowOpacity: 0.16,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: -8 },
      elevation: 8,
    },
  },
};

export const LightTheme = {
  // Surfaces
  background: DesignTokens.background.DEFAULT,
  backgroundLight: DesignTokens.background.DEFAULT,
  backgroundSurface: DesignTokens.background.surface,
  backgroundSurface2: DesignTokens.background.surface2,
  backgroundElevated: DesignTokens.background.elevated,
  backgroundInverse: DesignTokens.background.inverse,
  surface: DesignTokens.background.surface,
  surface2: DesignTokens.background.surface2,
  surfaceLight: DesignTokens.background.surface2,
  surfaceBorder: DesignTokens.border.DEFAULT,
  surfaceInactive: DesignTokens.background.surface2,
  surfaceGlow: DesignTokens.accent.soft,
  surfaceElevated: DesignTokens.background.elevated,
  overlay: DesignTokens.background.overlay,
  tabBarActive: DesignTokens.background.tabBarActive,

  // Text colors
  textPrimary: DesignTokens.ink.primary,
  textSecondary: DesignTokens.ink.secondary,
  textMuted: DesignTokens.ink.tertiary,
  white: DesignTokens.ink.inverse,
  black: DesignTokens.ink.primary,
  inkPrimary: DesignTokens.ink.primary,
  inkSecondary: DesignTokens.ink.secondary,
  inkTertiary: DesignTokens.ink.tertiary,
  inkInverse: DesignTokens.ink.inverse,
  inkDisabled: DesignTokens.ink.disabled,

  // Status & accent colors
  primary: DesignTokens.accent.DEFAULT,
  primaryGlow: DesignTokens.accent.soft,
  accent: DesignTokens.accent.DEFAULT,
  accentSoft: DesignTokens.accent.soft,
  accentStrong: DesignTokens.accent.strong,
  accentLight: DesignTokens.accent.soft,
  heatmapLight: DesignTokens.heatmap.light,
  heatmapMid: DesignTokens.heatmap.mid,
  success: DesignTokens.success.DEFAULT,
  successSoft: DesignTokens.success.soft,
  warning: DesignTokens.warning.DEFAULT,
  warningSoft: DesignTokens.warning.soft,
  danger: DesignTokens.danger.DEFAULT,
  dangerSoft: DesignTokens.danger.soft,
  progress: DesignTokens.accent.DEFAULT,
  progressBg: DesignTokens.background.surface2,

  // Toggle & borders
  toggleInactive: DesignTokens.background.surface2,
  border: DesignTokens.border.DEFAULT,
  borderStrong: DesignTokens.border.strong,
  muted: DesignTokens.ink.tertiary,
  input: DesignTokens.background.surface,
  container: DesignTokens.background.DEFAULT,

  // Category palette
  category: DesignTokens.category,
};

export const DarkTheme = LightTheme;
export const GoldenTheme = LightTheme;
export const FocusTheme = LightTheme;

export const ApTheme = {
  Color: LightTheme,
  Tokens: DesignTokens,
};
