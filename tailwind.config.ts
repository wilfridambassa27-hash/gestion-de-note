import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          50: '#f0fff4',
          400: '#1dff2f',
          500: '#1dff2f', // Pure Neon Green
          600: '#16cc26',
        },
        primary: {
          DEFAULT: '#1dff2f',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        accent: '#1dff2f',
      },
      animation: {
        'neon-pulse': 'pulse-neon 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 10px rgba(29, 255, 47, 0.4)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 0 25px rgba(29, 255, 47, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config;
