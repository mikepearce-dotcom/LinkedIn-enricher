import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        panel: "#ffffff",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
} satisfies Config;
