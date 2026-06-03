import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F1',
        card: '#F0EDE8',
        text: {
          DEFAULT: '#2C2A26',
          sub: '#888780',
        },
        blue: {
          DEFAULT: '#185FA5',
          light: '#E6F1FB',
        },
        orange: {
          DEFAULT: '#BA7517',
          light: '#FAEEDA',
        },
        red: {
          DEFAULT: '#A32D2D',
          light: '#FCEBEB',
        },
        green: {
          DEFAULT: '#1D9E75',
          light: '#D4F2E7',
          dark: '#085041',
        },
        border: '#C8C5BE',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '16px',
      },
      fontFamily: {
        sans: ['-apple-system', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
      },
      lineHeight: { relaxed: '1.6' },
      maxWidth: { phone: '390px' },
    },
  },
  plugins: [],
}

export default config
