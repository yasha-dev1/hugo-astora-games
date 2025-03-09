/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layouts/**/*.html", "./content/**/*.{html,md}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-pink': {
          DEFAULT: '#FF10F0',
          light: '#FF69B4',
          dark: '#B4006C'
        },
        'neon-blue': {
          DEFAULT: '#4DEEEA',
          light: '#7FFFD4',
          dark: '#008B8B'
        },
        'arcade-dark': '#0A0A0F',
        'arcade-darker': '#050508'
      },
      fontFamily: {
        'arcade': ['Press Start 2P', 'cursive'],
        'cyber': ['Orbitron', 'sans-serif']
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 0.4 }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}