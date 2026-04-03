import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hut: {
          cream: "#faf6f1",
          sand: "#f5ebe0",
          blush: "#fdf2f8",
          wood: "#c4a574",
          wooddeep: "#8b6914",
        },
        moon: {
          glow: "#f3e8ff",
          soft: "#e9d5ff",
          mist: "#ddd6fe",
        },
        petal: {
          DEFAULT: "#c026d3",
          deep: "#a21caf",
          light: "#e879f9",
        },
        lilac: {
          DEFAULT: "#a855f7",
          muted: "#c4b5fd",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: ["var(--font-display)", "var(--font-geist-sans)", "sans-serif"],
      },
      backgroundImage: {
        "hero-mist":
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(192, 38, 211, 0.12), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 0%, rgba(168, 85, 247, 0.1), transparent 50%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(243, 232, 255, 0.9), transparent 45%)",
        "section-soft":
          "linear-gradient(180deg, rgba(250, 246, 241, 0) 0%, rgba(243, 232, 255, 0.35) 50%, rgba(250, 246, 241, 0) 100%)",
      },
      boxShadow: {
        moon: "0 0 60px rgba(192, 38, 211, 0.15), 0 0 120px rgba(168, 85, 247, 0.08)",
        card: "0 4px 24px rgba(168, 85, 247, 0.08), 0 1px 3px rgba(192, 38, 211, 0.06)",
        glow: "0 0 40px rgba(232, 121, 249, 0.25)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 12s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
