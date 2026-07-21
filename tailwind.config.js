/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // E-ink / Kindle-inspired palette: warm paper, soft black ink, muted accents.
        brand: {
          DEFAULT: '#A63D40',
          dark: '#833134',
          gold: '#C99A45',
          green: '#4F7A5B',
        },
        // Dark variants use a cool graphite "night reading" scheme (see theme.ts).
        content: {
          DEFAULT: '#26241F',
          dark: '#EAECEF',
          muted: '#6E675A',
          'muted-dark': '#9CA3AD',
        },
        app: {
          DEFAULT: '#F7F4EC',
          dark: '#131417',
        },
        surface: {
          DEFAULT: '#FDFBF6',
          dark: '#1A1C20',
          elevated: '#FFFFFF',
          'elevated-dark': '#24262C',
        },
        element: {
          DEFAULT: '#EEE9DD',
          dark: '#22242A',
          selected: '#E3DCCC',
          'selected-dark': '#32353D',
        },
        line: {
          DEFAULT: '#DCD5C4',
          dark: '#33363E',
        },
        primary: {
          DEFAULT: '#A63D40',
          dark: '#EE8578',
          pressed: '#833134',
        },
        success: {
          DEFAULT: '#4F7A5B',
          dark: '#82C99B',
        },
        warning: {
          DEFAULT: '#8A6B29',
          dark: '#E6B95E',
        },
        danger: {
          DEFAULT: '#9C3332',
          dark: '#F49A90',
        },
        level: {
          'a1-bg': '#DFE7DA',
          'a1-text': '#3C5A40',
          'a2-bg': '#DAE3E8',
          'a2-text': '#33566A',
          'b1-bg': '#EFE5C8',
          'b1-text': '#6A551F',
          'b2-bg': '#EAD8D2',
          'b2-text': '#74392F',
          'c1-bg': '#E2DDE7',
          'c1-text': '#52465E',
          'c2-bg': '#E5E0D4',
          'c2-text': '#4C443A',
        },
      },
      spacing: {
        tab: '76px',
        'tab-ios': '54px',
      },
      borderRadius: {
        control: '12px',
        card: '18px',
        chip: '999px',
      },
      maxWidth: {
        app: '1120px',
        reader: '720px',
      },
      fontFamily: {
        sans: ['system-ui'],
        mono: ['ui-monospace'],
      },
      fontSize: {
        display: ['38px', { lineHeight: '44px', letterSpacing: '-1px', fontWeight: '800' }],
        title: ['30px', { lineHeight: '36px', letterSpacing: '-0.5px', fontWeight: '800' }],
        subtitle: ['24px', { lineHeight: '30px', fontWeight: '700' }],
        section: ['20px', { lineHeight: '26px', fontWeight: '700' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        small: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        label: ['13px', { lineHeight: '18px', letterSpacing: '0.3px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
