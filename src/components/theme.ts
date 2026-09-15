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

  // Gradient tokens
  isGradient: false,
  bgGradientStart: DesignTokens.background.DEFAULT,
  bgGradientMid: DesignTokens.background.surface,
  bgGradientEnd: DesignTokens.background.surface,
};

export type ThemeColors = typeof LightTheme;

export const DarkTheme: ThemeColors = {
  // Surfaces
  background: "#121212",
  backgroundLight: "#181816",
  backgroundSurface: "#1E1E1C",
  backgroundSurface2: "#282825",
  backgroundElevated: "#242421",
  backgroundInverse: "#F6F6F2",
  surface: "#1E1E1C",
  surface2: "#282825",
  surfaceLight: "#282825",
  surfaceBorder: "#2E2E2A",
  surfaceInactive: "#282825",
  surfaceGlow: "#1B3629",
  surfaceElevated: "#242421",
  overlay: "rgba(0, 0, 0, 0.70)",
  tabBarActive: "rgba(255, 255, 255, 0.16)",

  // Text colors
  textPrimary: "#F6F6F2",
  textSecondary: "#A8A8A1",
  textMuted: "#70706B",
  white: "#FFFFFF",
  black: "#121212",
  inkPrimary: "#F6F6F2",
  inkSecondary: "#A8A8A1",
  inkTertiary: "#70706B",
  inkInverse: "#131311",
  inkDisabled: "#4A4A46",

  // Status & accent colors
  primary: "#388E65",
  primaryGlow: "#1B3629",
  accent: "#388E65",
  accentSoft: "#1A3326",
  accentStrong: "#2B6A4D",
  accentLight: "#1A3326",
  heatmapLight: "#1F4230",
  heatmapMid: "#2B6A4D",
  success: "#388E65",
  successSoft: "#1A3326",
  warning: "#D49B37",
  warningSoft: "#382A12",
  danger: "#E0533C",
  dangerSoft: "#3A1813",
  progress: "#388E65",
  progressBg: "#282825",

  // Toggle & borders
  toggleInactive: "#282825",
  border: "#2E2E2A",
  borderStrong: "#3E3E38",
  muted: "#70706B",
  input: "#1E1E1C",
  container: "#121212",

  // Category palette
  category: {
    rose: { bg: "#361B24", ink: "#F2789B" },
    amber: { bg: "#382313", ink: "#F7A250" },
    mint: { bg: "#163328", ink: "#44D4A4" },
    violet: { bg: "#2B2144", ink: "#A28CF0" },
    sky: { bg: "#1A2B42", ink: "#5EA1EB" },
    sand: { bg: "#332A18", ink: "#D4B160" },
  },

  // Gradient tokens
  isGradient: false,
  bgGradientStart: "#121212",
  bgGradientMid: "#121212",
  bgGradientEnd: "#121212",
};

export const GoldenTheme: ThemeColors = {
  // Surfaces
  background: "#FDF5E6",
  backgroundLight: "#FFFDF9",
  backgroundSurface: "#FFFFFF",
  backgroundSurface2: "#F8ECD5",
  backgroundElevated: "#FFFFFF",
  backgroundInverse: "#D97706",
  surface: "#FFFFFF",
  surface2: "#F8ECD5",
  surfaceLight: "#FFFBF5",
  surfaceBorder: "#F0D8AF",
  surfaceInactive: "#F4E5CB",
  surfaceGlow: "#FDE6BA",
  surfaceElevated: "#FFFFFF",
  overlay: "rgba(59, 35, 14, 0.45)",
  tabBarActive: "rgba(217, 119, 6, 0.14)",

  // Text colors
  textPrimary: "#3B230E",
  textSecondary: "#755024",
  textMuted: "#9C7748",
  white: "#FFFFFF",
  black: "#241508",
  inkPrimary: "#3B230E",
  inkSecondary: "#755024",
  inkTertiary: "#9C7748",
  inkInverse: "#FFFFFF",
  inkDisabled: "#CCA77B",

  // Status & accent colors
  primary: "#D97706",
  primaryGlow: "#FDE6BA",
  accent: "#D97706",
  accentSoft: "#FEF3C7",
  accentStrong: "#B45309",
  accentLight: "#FEF3C7",
  heatmapLight: "#FDE68A",
  heatmapMid: "#D97706",
  success: "#2D8A58",
  successSoft: "#E0F4EA",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#D43825",
  dangerSoft: "#FCEBE8",
  progress: "#D97706",
  progressBg: "#F8ECD5",

  // Toggle & borders
  toggleInactive: "#F4E5CB",
  border: "#F0D8AF",
  borderStrong: "#E0BC85",
  muted: "#9C7748",
  input: "#FFFFFF",
  container: "#FDF5E6",

  // Category palette
  category: {
    rose: { bg: "#FCE7EC", ink: "#BE2A56" },
    amber: { bg: "#FEF3C7", ink: "#B45309" },
    mint: { bg: "#DCFCE7", ink: "#15803D" },
    violet: { bg: "#EDE9FE", ink: "#6D28D9" },
    sky: { bg: "#E0F2FE", ink: "#0369A1" },
    sand: { bg: "#FBF3DE", ink: "#926B1E" },
  },

  // Gradient tokens
  isGradient: true,
  bgGradientStart: "#F59E0B",
  bgGradientMid: "#FDE68A",
  bgGradientEnd: "#FFFDF7",
};

export const FocusTheme: ThemeColors = {
  // Surfaces
  background: "#0F1713",
  backgroundLight: "#14201B",
  backgroundSurface: "#18251F",
  backgroundSurface2: "#22332B",
  backgroundElevated: "#1E2F27",
  backgroundInverse: "#48A97A",
  surface: "#18251F",
  surface2: "#22332B",
  surfaceLight: "#22332B",
  surfaceBorder: "#273C32",
  surfaceInactive: "#22332B",
  surfaceGlow: "#163828",
  surfaceElevated: "#1E2F27",
  overlay: "rgba(10, 18, 14, 0.75)",
  tabBarActive: "rgba(72, 169, 122, 0.18)",

  // Text colors
  textPrimary: "#EDF6F1",
  textSecondary: "#A4BFB2",
  textMuted: "#6E897C",
  white: "#FFFFFF",
  black: "#0F1713",
  inkPrimary: "#EDF6F1",
  inkSecondary: "#A4BFB2",
  inkTertiary: "#6E897C",
  inkInverse: "#0A150F",
  inkDisabled: "#43554C",

  // Status & accent colors
  primary: "#48A97A",
  primaryGlow: "#163828",
  accent: "#48A97A",
  accentSoft: "#173628",
  accentStrong: "#378760",
  accentLight: "#173628",
  heatmapLight: "#1E4734",
  heatmapMid: "#388A62",
  success: "#48A97A",
  successSoft: "#173628",
  warning: "#D69E3A",
  warningSoft: "#382A12",
  danger: "#E0533C",
  dangerSoft: "#381A16",
  progress: "#48A97A",
  progressBg: "#22332B",

  // Toggle & borders
  toggleInactive: "#22332B",
  border: "#273C32",
  borderStrong: "#354F42",
  muted: "#6E897C",
  input: "#18251F",
  container: "#0F1713",

  // Category palette
  category: {
    rose: { bg: "#361E27", ink: "#F0829F" },
    amber: { bg: "#382817", ink: "#EAA654" },
    mint: { bg: "#173628", ink: "#48A97A" },
    violet: { bg: "#282442", ink: "#A296E8" },
    sky: { bg: "#192D3F", ink: "#5DA5E8" },
    sand: { bg: "#322E1F", ink: "#CEBD80" },
  },

  // Gradient tokens
  isGradient: false,
  bgGradientStart: "#0F1713",
  bgGradientMid: "#14201B",
  bgGradientEnd: "#0F1713",
};

export const getThemeVars = (colors: ThemeColors) => ({
  "--bg-gradient-start": colors.bgGradientStart,
  "--bg-gradient-mid": colors.bgGradientMid,
  "--bg-gradient-end": colors.bgGradientEnd,
  "--background": colors.background,
  "--background-surface": colors.surface,
  "--background-surface2": colors.surface2,
  "--background-elevated": colors.surfaceElevated,
  "--background-inverse": colors.backgroundInverse,
  "--ink-primary": colors.inkPrimary,
  "--ink-secondary": colors.inkSecondary,
  "--ink-tertiary": colors.inkTertiary,
  "--ink-inverse": colors.inkInverse,
  "--ink-disabled": colors.inkDisabled,
  "--border": colors.border,
  "--border-strong": colors.borderStrong,
  "--accent": colors.accent,
  "--accent-soft": colors.accentSoft,
  "--accent-strong": colors.accentStrong,
  "--success": colors.success,
  "--success-soft": colors.successSoft,
  "--warning": colors.warning,
  "--warning-soft": colors.warningSoft,
  "--danger": colors.danger,
  "--danger-soft": colors.dangerSoft,
  "--category-rose-bg": colors.category.rose.bg,
  "--category-rose-ink": colors.category.rose.ink,
  "--category-amber-bg": colors.category.amber.bg,
  "--category-amber-ink": colors.category.amber.ink,
  "--category-mint-bg": colors.category.mint.bg,
  "--category-mint-ink": colors.category.mint.ink,
  "--category-violet-bg": colors.category.violet.bg,
  "--category-violet-ink": colors.category.violet.ink,
  "--category-sky-bg": colors.category.sky.bg,
  "--category-sky-ink": colors.category.sky.ink,
  "--category-sand-bg": colors.category.sand.bg,
  "--category-sand-ink": colors.category.sand.ink,
});

export const ApTheme = {
  Color: LightTheme,
  Tokens: DesignTokens,
};

