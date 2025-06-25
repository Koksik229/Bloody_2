import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  prefix: "", // bw- prefix already baked in class names
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",

  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // BloodyWorld specific
        "bw-primary-red": "hsl(var(--bw-primary-red))",
        "bw-accent-gold": "hsl(var(--bw-accent-gold))",
        "bw-dark-bg": "hsl(var(--bw-dark-bg))",
        "bw-card-bg": "hsl(var(--bw-card-bg))",
        "bw-text-on-dark": "hsl(var(--bw-text-on-dark))",
        "bw-border": "hsl(var(--bw-border))",
        "bw-input": "hsl(var(--bw-input))",
        "bw-muted": "hsl(var(--bw-muted))",
        "bw-hover": "hsl(var(--bw-hover))",
        "bw-success": "hsl(var(--bw-success))",
        "bw-warning": "hsl(var(--bw-warning))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

      },
      keyframes: {
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
      },
      animation: {
        "progress-fill": "progress-fill 0.6s ease-out",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
