/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          bg:            '#0a0a0f',
          surface:      '#111111',
          border:       '#222222',
          hover:        '#333333',
          primary:      '#b45309',
          'primary-hover': '#92400e',
          text:         '#ffffff',
          muted:        '#666666',
          subtle:       '#888888',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
