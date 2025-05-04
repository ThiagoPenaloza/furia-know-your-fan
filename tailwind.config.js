/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        furia: '#000000',      // exemplo de cor custom
      },
    },
  },
  plugins: [],
}
