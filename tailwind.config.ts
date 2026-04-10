import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: "#E8553C",
          lt: "#F5A68A",
        },
        ink: {
          DEFAULT: "#0E0D0B",
          2: "#1C1A16",
          3: "#2E2B24",
        },
        sand: {
          DEFAULT: "#F2EDE4",
          2: "#E8E0D2",
        },
        muted: "#7A7368",
        green: "#1D9E75",
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
