/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        'mono': ['Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fffbeb',
          500: '#e2b84d',
          600: '#d4a83c',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
