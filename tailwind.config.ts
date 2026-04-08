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
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        '2xl': '2rem',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Geist Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],
        'sm': ['0.875rem', { lineHeight: '1.5rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        navy: {
          50: '#f8fafc',
          500: '#1e3a8a',
          600: '#1e40af',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e1b4b',
        },
        accent: '#10b981',
        gold: {
          50: '#fef7e0',
          100: '#fef3c7',
          500: '#d4af37',
          600: '#b8972e',
          700: '#9c8328'
        },
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669'
        },
        orange: {
          50: '#fff7ed',
          400: '#fb923c',
          500: '#f97316'
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'navy-glow': 'navyGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0, -20px, 0)' },
        },
        navyGlow: {
          '0%': { boxShadow: '0 0 20px rgba(30, 58, 138, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config;
