/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      spacing: {
        '3xs': '0.25rem',
        '2xs': '0.5rem',
        'xs': '1rem',
        'sm': '1.5rem',
        'md': '2rem',
        'lg': '3rem',
        'xl': '5rem',
        '2xl': '8rem',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.03)',
        glow: '0 0 30px rgba(246, 224, 94, 0.1)',
      },
      transitionDuration: {
        'slow': '1200ms',
        'slower': '2000ms',
        'slowest': '2500ms',
      },
      transitionTimingFunction: {
        'breathe': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
