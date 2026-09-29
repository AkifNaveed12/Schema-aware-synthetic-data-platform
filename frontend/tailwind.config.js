/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          hero: '#1C1D1F',
          nav: '#202124',
          secondary: '#6F7988',
          canvas: '#FAF8F4',
          stage: '#F8F7F4',
          navy: '#0F172A',
          sidebar: '#0F172A',
          teal: '#0D9488',
          'teal-hover': '#0F766E',
          'teal-dark': '#115E59',
          mint: '#E6F4F1',
          'mint-light': '#F0FDFA',
          border: '#E2E8F0',
          'border-dark': '#334155',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'micro': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'panel': '0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'modal': '0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}

