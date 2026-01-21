/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'mono': ['Space Mono', 'monospace'],
      },
      colors: {
        'ice': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        'puck': {
          DEFAULT: '#1a1a2e',
          dark: '#0f0f1a',
          light: '#25253d',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #38bdf8, 0 0 10px #38bdf8, 0 0 15px #38bdf8' },
          '100%': { boxShadow: '0 0 10px #0ea5e9, 0 0 20px #0ea5e9, 0 0 30px #0ea5e9' },
        }
      }
    },
  },
  plugins: [],
}
