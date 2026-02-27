import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
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
        // Legacy/Semantic mapping
        brand: {
          DEFAULT: "hsl(var(--brand))",
          light: "hsl(var(--brand-light))",
          dark: "hsl(var(--brand-dark))",
          text: "hsl(var(--brand))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          dark: "hsl(var(--success))",
        },
        warning: "hsl(var(--warning))",
        surface: "hsl(var(--card))",
        charcoal: {
          DEFAULT: "hsl(var(--foreground))",
          light: "hsl(var(--muted-foreground))",
        },
        // Premium Enterprise SaaS Tokens for Onboarding
        saas: {
          background: "#0A0A0A",
          surface: {
            DEFAULT: "#141414",
            hover: "#1F1F1F",
          },
          border: {
            DEFAULT: "#222222",
            focus: "rgba(255,255,255,0.2)",
          },
          brand: {
            DEFAULT: "#C1502E",
            dark: "#D45A34",
            light: "#E06640",
            glow: "rgba(193, 80, 46, 0.5)",
          },
          text: {
            primary: "#EDEDED",
            secondary: "#A1A1AA",
            tertiary: "#71717A",
          }
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Premium Enterprise SaaS Tokens
        "saas-sm": "6px",
        "saas-md": "10px",
        "saas-lg": "16px",
        "saas-xl": "24px",
      },
      boxShadow: {
        'warm': '0 2px 8px rgba(193, 80, 46, 0.08)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        // Premium Enterprise SaaS Tokens
        "saas-subtle": "0 1px 2px rgba(0, 0, 0, 0.1)",
        "saas-medium": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "saas-strong": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "saas-glow": "0 0 12px rgba(193, 80, 46, 0.5)",
      },
      transitionDuration: {
        "fast": "150ms",
        "normal": "250ms",
        "slow": "400ms",
      },
      scale: {
        "102": "1.02",
      },
      minHeight: {
        "saas-modal": "60vh",
      },
      blur: {
        "saas-huge": "100px",
        "saas-massive": "120px",
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
