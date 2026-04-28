/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#003B54', light: '#00405C', dark: '#001F30' },
        sky:    { bright: '#00B1FC', mid: '#009ADB', medium: '#0082BA', deep: '#006996' },
      },
      fontFamily: { sans: ['Inter', '-apple-system', 'sans-serif'] },
      boxShadow: {
        card:       '0 2px 16px rgba(0,0,0,0.08)',
        ui:         '0 2px 14px rgba(0,59,84,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        'ui-focus': '0 4px 20px rgba(0,59,84,0.16), 0 2px 6px rgba(0,0,0,0.08)',
        'ui-dark':  '0 4px 18px rgba(0,0,0,0.30), 0 2px 6px rgba(0,0,0,0.20)',
      },
    },
  },
  plugins: [],
};
