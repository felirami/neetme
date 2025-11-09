import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Pump.fun inspired neon theme
        neon: {
          primary: "#6AFF7F",
          "primary-alt": "#7CFF6B",
          secondary: "#A3FFD6",
        },
        dark: {
          bg: "#0b0c10",
          "bg-alt": "#0f1015",
        },
        gray: {
          primary: "#FFFFFF",
          secondary: "#9CA3AF",
          tertiary: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "Satoshi", "system-ui", "sans-serif"],
      },
      fontWeight: {
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      boxShadow: {
        "neon-sm": "0 0 10px rgba(106, 255, 127, 0.3), 0 0 20px rgba(106, 255, 127, 0.1)",
        "neon-md": "0 0 20px rgba(106, 255, 127, 0.4), 0 0 40px rgba(106, 255, 127, 0.2)",
        "neon-lg": "0 0 30px rgba(106, 255, 127, 0.5), 0 0 60px rgba(106, 255, 127, 0.3)",
        "neon-secondary": "0 0 20px rgba(163, 255, 214, 0.3), 0 0 40px rgba(163, 255, 214, 0.1)",
      },
      backgroundImage: {
        "dark-gradient": "linear-gradient(180deg, #0b0c10 0%, #0f1015 100%)",
        "dark-gradient-radial": "radial-gradient(ellipse at center, #0f1015 0%, #0b0c10 100%)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

