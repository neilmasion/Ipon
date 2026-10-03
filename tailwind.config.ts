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
          bg: "#FAFAFA",
          card: "#FFFFFF",
          text: "#222222",
          muted: "#777777",
          border: "#F0E4E8",
          saved: "#10B981", // 🟢
          partial: "#F59E0B", // 🟡
          missed: "#EF4444", // 🔴
          planned: "#E5E7EB", // ⚪
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(255, 79, 129, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px -3px rgba(255, 79, 129, 0.25)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
