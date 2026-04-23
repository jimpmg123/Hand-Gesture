/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Trebuchet MS', 'Segoe UI Variable', 'Gill Sans', 'sans-serif'],
        serif: ['Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

