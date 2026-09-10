/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // NOTE: Tailwind/NativeWind color classes are resolved at build time and
        // are NOT theme-reactive. They mirror the DarkTheme palette as a static
        // fallback. For light/dark-aware styling use inline `style={{ ... }}`
        // with the `useTheme()` colors, not these classes.

        // Primary accent color
        primary: "#10B981",

        // Background colors
        background: "#0B130E",
        backgroundLight: "#111F17",

        // Surface colors (cards, containers)
        surface: "#14251B",
        surfaceLight: "#1D3527",
        surfaceBorder: "#1F3A2B",
        surfaceInactive: "#19271E",

        // Text colors
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",

        // Status colors
        success: "#10B981",
        progress: "#10B981",
        progressBg: "#112217",
        warning: "#F59E0B",
        danger: "#EF4444",
        accent: "#A78BFA",

        // Toggle inactive
        toggleInactive: "#2A3E31",

        // Legacy compatibility
        black: "#020617",
        white: "#FFFFFF",
        muted: "#64748B",
        border: "#1F3A2B",
        input: "#14251B",
      },
      fontFamily: {
        display: ["Inter"],
      },
    },
  },
  plugins: [],
};
