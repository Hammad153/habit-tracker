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
        primary: "#4FA3A5",
        background: "#0F172A",
        surface: "#1E293B",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        black: "#020617",
        white: "#FFFFFF",
        muted: "#64748B",
        border: "#334155",
        input: "#020617",
        success: "#22C55E",
        progress: "#4ADE80",
        warning: "#F59E0B",
        danger: "#EF4444",
        accent: "#38BDF8",
      }

    },
  },
  plugins: [],
}