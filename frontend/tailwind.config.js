/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon': '#ccff00',
        'neon-hover': '#b3e600',
        'accent-blue': '#0055ff',
        'dark': '#000000',
        'primary-bg': '#ffffff',
        'secondary-bg': '#f4f5f7',
        'tertiary-bg': '#e9ecef',
      },
      fontFamily: {
        'teko': ['Teko', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'akira': ['Akira', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 4px 20px rgba(204, 255, 0, 0.4)',
        'dark': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'hard': '6px 6px 0 var(--tw-shadow-color)',
        'hard-hover': '10px 10px 0 var(--tw-shadow-color)',
      }
    },
  },
  plugins: [],
}
