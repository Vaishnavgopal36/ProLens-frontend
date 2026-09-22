/**
 * Colours defined as plain CSS variables (`var(--teal-500)`) can't take a
 * Tailwind opacity modifier, so classes like `bg-teal-500/10` silently produced
 * no CSS at all. Wrapping them with color-mix makes every modifier work while
 * `bg-teal-500` (no modifier) stays a plain `var()`.
 */
const withAlpha =
  (variable) =>
  ({ opacityValue }) =>
    opacityValue === undefined || String(opacityValue).startsWith("var(")
      ? `var(${variable})`
      : `color-mix(in srgb, var(${variable}) calc(${opacityValue} * 100%), transparent)`;

/** A 50..900 brand scale backed by --<name>-<step> variables. */
const scale = (name) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => [
      step,
      withAlpha(`--${name}-${step}`),
    ]),
  );

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./.storybook/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: {
          DEFAULT: withAlpha("--border-subtle"),
          subtle: withAlpha("--border-subtle"),
          strong: withAlpha("--border-strong"),
        },
        input: withAlpha("--border-subtle"),
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          inverse: "var(--foreground-inverse)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          foreground: "var(--surface-foreground)",
        },
        plain: {
          DEFAULT: "var(--plain)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Was a hardcoded Tailwind-default blue scale (50–900), completely
          // disconnected from --brand-*. Any `primary-500`-style class (chart
          // strokes, stat-card accents) was rendering stock blue instead of
          // brand plum, even though bare `primary`/`bg-primary` was correct.
          ...scale("brand"),
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
          "foreground-1": "var(--muted-foreground-1)",
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
        brand: scale("brand"),
        lime: scale("lime"),
        navy: scale("navy"),
        teal: scale("teal"),
        gold: scale("gold"),
        ribbon: {
          periwinkle: withAlpha("--ribbon-periwinkle"),
          amber: withAlpha("--ribbon-amber"),
          coral: withAlpha("--ribbon-coral"),
          rose: withAlpha("--ribbon-rose"),
          magenta: withAlpha("--ribbon-magenta"),
        },
        sidebar: {
          DEFAULT: withAlpha("--sidebar-bg"),
          bg: withAlpha("--sidebar-bg"),
          surface: withAlpha("--sidebar-surface"),
          border: withAlpha("--sidebar-border"),
          foreground: withAlpha("--sidebar-foreground"),
          "foreground-hover": withAlpha("--sidebar-foreground-hover"),
          "active-bg": withAlpha("--sidebar-active-bg"),
          "active-text": withAlpha("--sidebar-active-text"),
          "active-accent": "var(--sidebar-active-accent)",
          glow: "var(--sidebar-glow)",
        },
        canvas: {
          bg: withAlpha("--canvas-bg"),
          surface: withAlpha("--canvas-surface"),
          overlay: withAlpha("--canvas-overlay"),
        },
      },
      backgroundImage: {
        "sidebar-gradient": "var(--sidebar-bg-gradient)",
        "ribbon-spectrum": "var(--sidebar-active-accent)",
      },
      animation: {
        "checkbox-wave": "checkboxWave 0.4s ease",
      },
      keyframes: {
        checkboxWave: { "50%": { transform: "scale(0.9)" } },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      // Micro sizes below Tailwind's default "xs" (12px) — badges, table
      // meta text, and chart labels throughout the app all land on one of
      // these four sizes already; naming them turns that de facto scale
      // into an actual token instead of one-off text-[Npx] arbitrary values.
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px
        "3xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px
        "4xs": ["0.5625rem", { lineHeight: "0.75rem" }], // 9px
        "5xs": ["0.5rem", { lineHeight: "0.75rem" }], // 8px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};