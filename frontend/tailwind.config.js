/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1220',
        card: '#141f36',
        cardBorder: '#1f3156',
        primaryBlue: '#2563eb',
        primaryBlueHover: '#1d4ed8',
        emeraldPill: '#064e3b',
        emeraldBorder: '#059669',
      }
    },
  },
  plugins: [],
}
