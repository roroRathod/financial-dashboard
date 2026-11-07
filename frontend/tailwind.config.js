/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: { 900: '#0f172a', 950: '#020617' },
        green: { 400: '#4ade80' },
        red: { 400: '#f87171' },
        roro: {
          lime: '#b7eb4d',
          darkBg: '#090d16',
          darkCard: '#0f1523',
          darkBorder: '#1c2538',
          lightBg: '#f7f5ef',
          lightCard: '#ffffff',
          lightBorder: '#e5e1d8',
          lightMuted: '#ede9df',
          forest: '#1b4313',
        },
      },
    },
  },
  plugins: [],
}
