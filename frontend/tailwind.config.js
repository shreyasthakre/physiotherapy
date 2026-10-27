/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Calming medical blue
        brand: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe1fe',
          300: '#93cefd',
          400: '#60b0fa',
          500: '#3b8ff6',
          600: '#2570eb',
          700: '#1d59d8',
          800: '#1e49af',
          900: '#1e408a',
        },
        // Healing green
        teal: {
          50: '#effcf6',
          100: '#c6f7e2',
          200: '#8eedc7',
          300: '#5fe3b1',
          400: '#2dcca7',
          500: '#17b897',
          600: '#079a82',
          700: '#048271',
          800: '#016457',
          900: '#004440',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(37, 112, 235, 0.25)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
