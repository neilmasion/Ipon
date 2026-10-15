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
        ipon: {
          primary: "#FF4F81",
          primaryHover: "#E63E6F",
          light: "#FFF0F4",
          soft: "#FFE4EC",
          bg: "#FFF5F8",
          card: "#FFFFFF",
          text: "#1E1E24",
          muted: "#71717A",
          border: "#F3E3E9",
          saved: "#10B981", // 🟢
          partial: "#F59E0B", // 🟡
          missed: "#EF4444", // 🔴
          planned: "#E5E7EB", // ⚪
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(255, 79, 129, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px -2px rgba(255, 79, 129, 0.35)",
        glass: "0 8px 32px 0 rgba(255, 79, 129, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
        "glass-sm": "0 4px 16px 0 rgba(255, 79, 129, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        "glass-lg": "0 16px 48px -8px rgba(255, 79, 129, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.03), inset 0 1px 2px 0 rgba(255, 255, 255, 1)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '24px',
        '3xl': '40px',
      }
    },
  },
  plugins: [],
};
export default config;
