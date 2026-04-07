/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#0a0612', 800: '#110d1d', 700: '#1a1428', 600: '#231c34' },
        coral: { 400: '#ff8a80', 500: '#ff6b6b', 600: '#ee5a24' },
        amber: { 400: '#ffd93d', 500: '#f9ca24' },
        violet: { 400: '#a29bfe', 500: '#6c5ce7' },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
