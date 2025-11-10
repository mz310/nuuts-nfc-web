/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Original color system
        brand: {
          DEFAULT: 'rgba(255, 240, 1, 1)',
          soft: 'rgba(255, 240, 1, 0.16)',
          soft2: 'rgba(255, 240, 1, 0.06)',
        },
        bg: {
          DEFAULT: '#030712',
          soft: '#020817',
        },
        text: {
          DEFAULT: '#e5e7eb',
          muted: '#9ca3af',
        },
        row: {
          DEFAULT: '#020817',
          hover: '#040b1a',
        },
        border: {
          DEFAULT: '#111827',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.6875rem', { lineHeight: '1.4' }],      // 11px
        sm: ['0.75rem', { lineHeight: '1.4' }],         // 12px
        base: ['0.875rem', { lineHeight: '1.4' }],     // 14px
        lg: ['1rem', { lineHeight: '1.4' }],           // 16px
        xl: ['1.125rem', { lineHeight: '1.4' }],       // 18px
        '2xl': ['1.5rem', { lineHeight: '1.4' }],     // 24px
      },
      spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.25rem', // 20px
        full: '9999px',
      },
      boxShadow: {
        DEFAULT: '0 20px 50px rgba(0, 0, 0, 0.85)',
        sm: '0 4px 12px rgba(0, 0, 0, 0.1)',
        md: '0 12px 28px rgba(0, 0, 0, 0.9)',
      },
      backdropBlur: {
        DEFAULT: '18px',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
