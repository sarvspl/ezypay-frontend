/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9ecff',
          500: '#1f7ae0',
          600: '#1862b8',
          700: '#124d92',
        },
        grad: {
          start: '#2F2097',  // deep indigo
          mid:   '#3B3AB0',  // midpoint
          end:   '#54CEFF',  // light cyan
        },
      },
    },
  },
  plugins: [],
};
