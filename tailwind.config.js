/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E40AF',
        'accent': '#10B981',
        'danger': '#DC2626',
        'warning': '#F59E0B',
        'surface': '#FFFFFF',
        'background': '#F9FAFB',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tajawal', 'Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

