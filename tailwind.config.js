/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#6C63FF',
        'accent-dark': '#5a52e0',
        'accent-light': '#EEF2FF',
        'app-bg': '#F8FAFC',
        'card': '#FFFFFF',
        'border-default': '#E5E7EB',
        'border-hover': '#C4B5FD',
        'border-focus': '#6C63FF',
        'text-main': '#111827',
        'text-sub': '#6B7280',
        'text-light': '#9CA3AF',
      },
      fontFamily: {
        sans: ["'Segoe UI'", 'system-ui', '-apple-system', "'Helvetica Neue'", 'sans-serif'],
        mono: ["'Consolas'", "'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      borderRadius: {
        card: '14px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,.07), 0 2px 8px rgba(0,0,0,.04)',
        sm: '0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04)',
        lg: '0 10px 40px rgba(0,0,0,.10), 0 4px 16px rgba(0,0,0,.06)',
      },
      maxWidth: {
        wrapper: '960px',
      },
    },
  },
  plugins: [],
}
