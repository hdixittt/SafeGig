/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FFCE32', dark: '#1D63FF', light: '#FFE080' },
        yellow: { DEFAULT: '#FFCE32', light: '#FFE080', dark: '#E6B800' },
        prussian: { DEFAULT: '#1D63FF', dark: '#1450CC', light: '#4D85FF' },
        dark: {
          900: '#0a0a0f',
          800: '#0f0f1a',
          700: '#1a1a2e',
          600: '#16213e',
          500: '#2d2d3d',
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
