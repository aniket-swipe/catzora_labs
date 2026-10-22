/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        sunken: "rgb(var(--sunken) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        create: "rgb(var(--create) / <alpha-value>)",
        "create-soft": "rgb(var(--create-soft) / <alpha-value>)",
        grow: "rgb(var(--grow) / <alpha-value>)",
        "grow-soft": "rgb(var(--grow-soft) / <alpha-value>)",
        hire: "rgb(var(--hire) / <alpha-value>)",
        "hire-soft": "rgb(var(--hire-soft) / <alpha-value>)",
        automate: "rgb(var(--automate) / <alpha-value>)",
        "automate-soft": "rgb(var(--automate-soft) / <alpha-value>)",
        support: "rgb(var(--support) / <alpha-value>)",
        "support-soft": "rgb(var(--support-soft) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 0 0 1px rgb(15 23 42 / 0.05)",
        lift: "0 8px 24px -8px rgb(15 23 42 / 0.16), 0 0 0 1px rgb(15 23 42 / 0.06)",
        pop: "0 16px 48px -12px rgb(15 23 42 / 0.28), 0 0 0 1px rgb(15 23 42 / 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        "fade-up": { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: { "fade-up": "fade-up .22s ease-out both" },
    },
  },
  plugins: [],
};
