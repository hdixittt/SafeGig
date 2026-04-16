/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#3D52A0', dark: '#2d3d7a', light: '#7091E6' },
        palette: {
          navy:    '#3D52A0',
          blue:    '#7091E6',
          muted:   '#8697C4',
          soft:    '#ADBBDA',
          lavender:'#EDE8F5',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%) skewX(-12deg)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite'
      }
    },
  },
  plugins: [],
};
