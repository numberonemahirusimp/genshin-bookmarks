/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f2f5',
          100: '#d9dce3',
          200: '#b3b9c7',
          300: '#8d96ab',
          400: '#676f8f',
          500: '#454d6a',
          600: '#363d55',
          700: '#2a3045',
          800: '#1e2335',
          900: '#141825',
          950: '#0c0f18',
        },
        gold: {
          50: '#fdf8f0',
          100: '#f9edd9',
          200: '#f2d9b3',
          300: '#e9c28a',
          400: '#dfa85e',
          500: '#d4903a',
          600: '#c77a2c',
          700: '#a56124',
          800: '#854d1f',
          900: '#6c401d',
          950: '#3b210f',
        },
        parchment: {
          50: '#fefcf7',
          100: '#fbf5e8',
          200: '#f5e9cc',
          300: '#edd9a5',
          400: '#e2c377',
          500: '#d8ab4f',
          600: '#ca9435',
          700: '#a8792a',
          800: '#886124',
          900: '#6f4f20',
          950: '#3d2910',
        },
      },
      fontFamily: {
        display: ['"HYWenHei-85W"', '"Cormorant Garamond"', '"Noto Serif SC"', 'serif'],
        body: ['"HYWenHei-85W"', '"Inter"', '"Noto Sans SC"', 'sans-serif'],
        ui: ['"HYWenHei-85W"', '"Inter"', '"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'dock': '0 -2px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(212, 163, 90, 0.15)',
        'card': '0 2px 20px rgba(0, 0, 0, 0.25), 0 0 1px rgba(212, 163, 90, 0.1)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.35), 0 0 1px rgba(212, 163, 90, 0.2)',
        'glow-subtle': '0 0 30px rgba(212, 163, 90, 0.06)',
        'inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      animation: {
        'dock-float': 'dock-float 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        'dock-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
