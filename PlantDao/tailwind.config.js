/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'plant': {
          50: '#f0fdf0',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#6DBE45',
          500: '#4ade80',
          600: '#2E7D32',
          700: '#256d2a',
          800: '#1a5c1f',
          900: '#14532d',
        },
        'gold': {
          300: '#FCD34D',
          400: '#F4B400',
          500: '#EAB308',
        },
        'cream': {
          50: '#FFFDF7',
          100: '#FFF9E6',
          200: '#FFF3CC',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(109, 190, 69, 0.15)',
        'glow': '0 0 20px rgba(109, 190, 69, 0.3)',
        'glow-gold': '0 0 20px rgba(244, 180, 0, 0.3)',
      },
    },
  },
  plugins: [],
}