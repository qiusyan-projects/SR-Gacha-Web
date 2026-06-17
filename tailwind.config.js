/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'star-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.5)' },
        },
        'card-reveal': {
          '0%': { opacity: '0', transform: 'rotateY(90deg) scale(0.8)' },
          '60%': { opacity: '1', transform: 'rotateY(-5deg) scale(1.02)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg) scale(1)' },
        },
        'golden-glow': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(245,158,11,0.2), 0 0 60px rgba(245,158,11,0.06)' },
          '50%': { boxShadow: '0 0 50px rgba(245,158,11,0.4), 0 0 90px rgba(245,158,11,0.15)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
      },
      animation: {
        'star-pulse': 'star-pulse 3s ease-in-out infinite alternate',
        'card-reveal': 'card-reveal 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'golden-glow': 'golden-glow 1.5s ease-in-out infinite alternate',
        'float-up': 'float-up 1.5s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
