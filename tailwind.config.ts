import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f7f3",
        foreground: "#253e3d",
        primary: "#426e65",
        muted: "#e8eee9",
        border: "#e0e4dd",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
