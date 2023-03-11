/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      gray: {
        DEFAULT: '#242424',
        dark: '#141414',
        light: '#2e2e2e'
      },
      white: {
        DEFAULT: '#fff',
        soft: 'rgba(255, 255, 255, 0.87)',
        fade: 'rgba(235, 235, 235, 0.50)'
      }
    },
    extend: {}
  },
  plugins: []
}
