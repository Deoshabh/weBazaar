/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ─── Color Tokens ─── */
      colors: {
        // New semantic palette
        ink: "var(--color-ink)",
        espresso: "var(--color-espresso)",
        walnut: "var(--color-walnut)",
        caramel: "var(--color-caramel)",
        sand: "var(--color-sand)",
        linen: "var(--color-linen)",
        cream: "var(--color-cream)",

        gold: {
          DEFAULT: "var(--color-gold)",
          light: "var(--color-gold-light)",
          dark: "var(--color-gold-dark)",
        },

        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          bg: "var(--color-error-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg: "var(--color-info-bg)",
        },

        // Legacy aliases — keeps existing classes working
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        brand: {
          brown: "var(--color-brand-brown)",
          tan: "var(--color-brand-tan)",
          cream: "var(--color-brand-cream)",
        },
      },

      /* ─── Font Families ─── */
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
      },

      /* ─── Font Size / Typography Scale ─── */
      fontSize: {
        display: ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["48px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h2: ["36px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h3: ["28px", { lineHeight: "1.3" }],
        h4: ["22px", { lineHeight: "1.4" }],
        h5: ["18px", { lineHeight: "1.5" }],
        "body-lg": ["18px", { lineHeight: "1.7" }],
        body: ["16px", { lineHeight: "1.7" }],
        "body-sm": ["14px", { lineHeight: "1.6" }],
        caption: ["12px", { lineHeight: "1.5", letterSpacing: "0.04em" }],
      },

      /* ─── Spacing Scale ─── */
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-5": "var(--space-5)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-10": "var(--space-10)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        "space-20": "var(--space-20)",
        "space-24": "var(--space-24)",
        // Legacy aliases
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      /* ─── Shadows ─── */
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },

      /* ─── Transitions ─── */
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },
      transitionTimingFunction: {
        "ease-out-custom": "var(--ease-out)",
        "ease-in-out-custom": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
      },

      /* ─── Animations ─── */
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        breath: "breath 8s ease-in-out infinite",
        "draw-line": "drawLine 4s ease-in-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "bounce-cart": "bounceCart 0.3s var(--ease-spring)",
        "marquee": "marquee 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        breath: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.15)", opacity: "0.6" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceCart: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
