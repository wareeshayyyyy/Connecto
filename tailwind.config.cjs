/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6366f1', // Add this color
          600: '#4f46e5', // Optional darker shade
        },
      },
      ringColor: {
        'primary-500': '#6366f1', // Specifically for ring color
      },
    },
  },
  plugins: [],
}