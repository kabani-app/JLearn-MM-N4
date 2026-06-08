/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0F0F13',
        darkSurface: '#1A1A22',
        darkBorder: '#333348',
        lightBg: '#F8FAFC',
        lightSurface: '#FFFFFF',
        lightBorder: '#E2E8F0',
      },
    },
  },
  plugins: [],
}
