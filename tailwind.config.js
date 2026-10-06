/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paper: 'var(--paper)',
      'paper-2': 'var(--paper-2)',
      ink: 'var(--ink)',
      'ink-2': 'var(--ink-2)',
      rule: 'var(--rule)',
      accent: 'var(--accent)',
    },
    extend: {
      fontFamily: {
        serif: ['"Newsreader Variable"', 'Georgia', 'serif'],
        mono: ['"Spline Sans Mono Variable"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
