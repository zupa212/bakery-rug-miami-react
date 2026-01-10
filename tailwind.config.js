/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
          950: '#0B1D2F',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F5F0E6',
          300: '#EBE2D0',
          400: '#E0D2B8',
          500: '#D4C1A0',
          600: '#C2AC85',
          700: '#A68F68',
          800: '#8A7552',
          900: '#6E5D42',
        },
        burgundy: {
          50: '#FBF5F6',
          100: '#F5E6E9',
          200: '#ECCDD3',
          300: '#E0AAB5',
          400: '#D28594',
          500: '#C15C70',
          600: '#9E3F51',
          700: '#7D2E3D',
          800: '#5F1E29',
          900: '#42121A',
        },
        // Refined "Champagne Gold" - less yellow, more metallic
        gold: {
          50: '#FBF9F4',
          100: '#F5F0E3',
          200: '#E9DEC2',
          300: '#DDCBA1',
          400: '#D1B980',
          500: '#C5A760',
          600: '#A68A48',
          700: '#876F38',
          800: '#69552B',
          900: '#4B3C1E',
        },
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        heading: ['Cinzel', 'serif'], // New heading font
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\" opacity=\"0.05\"/%3E%3C/svg%3E')",
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'luxury': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.5)',
      },
      letterSpacing: {
        'widest-xl': '0.2em',
      }
    },
  },
  plugins: [],
};
