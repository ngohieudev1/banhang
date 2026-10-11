import type { Config } from "tailwindcss";

const scale = (name: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      `oklch(var(--${name}-${step}) / <alpha-value>)`,
    ]),
  );

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: scale("background"),
        primary: scale("primary"),
        accent: scale("accent"),
        secondary: scale("secondary"),
        foreground: scale("foreground"),
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        label: ["var(--font-label)"],
      },
      maxWidth: {
        site: "1440px",
      },
      keyframes: {
        "cf-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "cf-marquee": "cf-marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
