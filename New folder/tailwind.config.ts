import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f5efe4",
        line: "#d6ccb7",
        accent: "#d97706",
        accentSoft: "#fbbf24"
      },
      boxShadow: {
        glow: "0 25px 80px rgba(217, 119, 6, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
