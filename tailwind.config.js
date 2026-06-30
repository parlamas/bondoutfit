/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          ink: '#241F1A',       // near-black warm charcoal, for headings/primary text
          inksoft: '#5C5347',   // muted body text
          paper: '#FAF7F2',     // warm ivory background
          stone: '#EFE9DD',     // card/panel background
          stoneborder: '#DED4BF', // borders/dividers
          gold: '#B8863F',      // reward/accent — discounts, CTAs
          goldsoft: '#F3E3C2',  // light gold background for badges
          golddeep: '#8F6526',  // hover state for gold
        },
      },
    },
  },
  plugins: [],
}

