/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NextGen Coding Color Palette
        nextgen: {
          'dark-blue': '#081729',
          'light-blue': '#0b1a33',
          'teal': '#59d8e7',
          'teal-hover': '#46b8c4',
          'white': '#FFFFFF',
          'light-gray': '#c8c8c8',
          'dark-gray': '#202020',
          'medium-gray': '#2a2a2a',
          'hover-gray': '#3a3a3a',
          'disabled-gray': '#1a1a1a',
          'text-disabled': '#666666',
          'success': '#28a745',
          'warning': '#ff9800',
          'error': '#ff4d4f',
        },
        // Couleurs sémantiques directes
        'primary': '#59d8e7',
        'primary-foreground': '#202020',
        'secondary': '#2a2a2a',
        'secondary-foreground': '#c8c8c8',
        'background': '#081729',
        'foreground': '#FFFFFF',
        'muted': '#0b1a33',
        'muted-foreground': '#c8c8c8',
        'card': '#0b1a33',
        'card-foreground': '#FFFFFF',
        'popover': '#0b1a33',
        'popover-foreground': '#FFFFFF',
        'border': '#c8c8c8',
        'input': '#c8c8c8',
        'ring': '#59d8e7',
        'destructive': '#ff4d4f',
        'destructive-foreground': '#FFFFFF',
      },
      boxShadow: {
        'nextgen': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'nextgen-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'nextgen': '8px',
      },
    },
  },
  plugins: [],
};
