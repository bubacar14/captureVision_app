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
        primary: {
          dark: '#101D25',
          DEFAULT: '#232D36',
          light: '#9FA2A7',
        },
        accent: {
          DEFAULT: '#00B09C',
        },
        // Ajout des couleurs existantes
        gray: {
          50: '#F7F8FA',
          100: '#EEF0F2',
          200: '#E5E7EA',
          300: '#D1D5DA',
          400: '#9FA2A7',
          500: '#6C7177',
          600: '#4D5358',
          700: '#373C41',
          800: '#232D36',
          900: '#101D25',
        },
        teal: {
          50: '#E6F7F5',
          100: '#B3E7E2',
          200: '#80D7CE',
          300: '#4DC7BA',
          400: '#1AB7A7',
          500: '#00B09C',
          600: '#009B8A',
          700: '#008677',
          800: '#007264',
          900: '#005E52',
        },
      },
    },
  },
  plugins: [],
}
