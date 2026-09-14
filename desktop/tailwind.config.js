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
        arvix: {
          dark: '#06070a',
          surface: '#0b0e17',
          card: '#111524',
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#7928ca',
          magenta: '#ff007f',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'orb-pulse': 'orbPulse 4s infinite ease-in-out',
        'pulse-green': 'pulseDot 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
      }
    },
  },
  plugins: [],
}
