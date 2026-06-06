/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        seashell: '#FFF5EE',
        peach:    '#FCEAD9',
        peach2:   '#FFE3CC',
        ink:      '#0A0A0A',
        orange:   '#FF6A00',
        orange2:  '#E85D04',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl2: '24px',
        xl3: '32px',
        xl4: '40px',
      },
      boxShadow: {
        soft:   '0 30px 60px -28px rgba(120,60,20,0.22), 0 8px 24px -16px rgba(120,60,20,0.14)',
        softer: '0 18px 40px -24px rgba(120,60,20,0.18)',
        glow:   '0 30px 80px -30px rgba(255,106,0,0.45)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
}

