// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // alle Dateien in /src
    './app/**/*.{js,ts,jsx,tsx,mdx}', // alle Dateien in /app
    './components/**/*.{js,ts,jsx,tsx,mdx}', // alle UI-Komponenten
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['"Press Start 2P"', 'system-ui'],
      },
      colors: {
        dark: '#0f0f0f',
        light: '#f1f1f1',
        memex: '#63c861',
        bluex: '#898CFF',
      },
      boxShadow: {
        glow: '0 0 8px #898CFF, 0 0 20px #898CFF',
        glowSm: '0 0 4px #898CFF',
        glowMemex: '0 0 8px #63c861, 0 0 20px #63c861',
      },
    },
  },
  plugins: [],
};