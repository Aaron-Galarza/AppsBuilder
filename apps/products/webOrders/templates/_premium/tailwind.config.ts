import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'INJECT_PRIMARY_COLOR',
        secondary: 'INJECT_SECONDARY_COLOR',
        accent: 'INJECT_ACCENT_COLOR',
      },
      fontFamily: {
        heading: ['INJECT_FONT_HEADING', 'sans-serif'],
        body: ['INJECT_FONT_BODY', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
