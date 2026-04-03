import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
      },
      colors: {
        art: {
          primary: "#FF6B9D",
          bg: "#2d0f1e",
          border: "#ff6b9d",
        },
        science: {
          primary: "#00D4FF",
          bg: "#071e2d",
          border: "#00d4ff",
        },
        law: {
          primary: "#FFD700",
          bg: "#1e1700",
          border: "#ffd700",
        },
        game: {
          bg: "#0a0a18",
          dialog: "#12122a",
          border: "#4a4a8a",
          text: "#e8e8f0",
          muted: "#7070a0",
        },
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pixelIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "60%": { opacity: "1", transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        pixelIn: "pixelIn 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
