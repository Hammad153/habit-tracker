/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary accent color
        primary: "#13ec5b",

        // Background colors
        background: "#102216",
        backgroundLight: "#f6f8f6",

        // Surface colors (cards, containers)
        surface: "#1A2C20",
        surfaceLight: "#ffffff",
        surfaceBorder: "#23482f",
        surfaceInactive: "#232423",

        // Text colors
        textPrimary: "#FFFFFF",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",

        // Status colors
        success: "#13ec5b",
        progress: "#13ec5b",
        progressBg: "#112217",
        warning: "#F59E0B",
        danger: "#EF4444",

        // Toggle inactive
        toggleInactive: "#343a36",

        // Legacy compatibility
        black: "#020617",
        white: "#FFFFFF",
        muted: "#64748B",
        border: "#23482f",
        input: "#1A2C20",
      },
      fontFamily: {
        display: ["Inter"],
      },
    },
  },
  plugins: [],
};
