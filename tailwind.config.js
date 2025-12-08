// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f1f',
        accent: '#8b5cf6', // lila
        contrast: '#fcd249', // gelb
        text: '#ffffff',
      },
      fontFamily: {
        sans: ['DolceVita', 'sans-serif'],
      },
      dropShadow: {
        glow: '0 10px #8b5cf6',
        intense: '0 0 25px #8b5cf6',
      },
      backgroundImage: {
        'glow-frame': 'radial-gradient(ellipse at center, #8b5cf6 0%, transparent 70%)',
      },
      spacing: {
        'nav': '72px',
      },
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};