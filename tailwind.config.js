/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          "'Open Sans'",
          "'Helvetica Neue'",
          'sans-serif',
        ],
        furia: [
          'FontFURIA',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          "'Open Sans'",
          "'Helvetica Neue'",
          'sans-serif',
        ],
        heading: [
          'FontFURIA',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          "'Open Sans'",
          "'Helvetica Neue'",
          'sans-serif',
        ],
      },
      colors: {
        background: '#000',
        foreground: '#fff',
        primary: '#f7c600',
        muted: '#222',
        border: '#333'
      },
      borderColor: {
        DEFAULT: "hsl(var(--border))",
      },
      backgroundColor: {
        DEFAULT: "hsl(var(--background))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
