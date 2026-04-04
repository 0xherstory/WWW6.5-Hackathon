/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', '"Courier New"', 'monospace'], 
      },
      colors: {
        neon: {
          pink: '#FF00FF',
          green: '#00FFCC',
          purple: '#B026FF'
        }
      }
    },
  },
  plugins: [],
}