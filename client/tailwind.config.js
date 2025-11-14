/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- AJOUTEZ CETTE LIGNE IMPORTANTE
  theme: {
    extend: {},
  },
  plugins: [],
}