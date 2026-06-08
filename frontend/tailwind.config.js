/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090a0f',
        darkCard: '#121420',
        neonPurple: '#8b5cf6',
        neonIndigo: '#6366f1',
        neonCyan: '#06b6d4',
        accentGold: '#f59e0b',
        textPrimary: '#f3f4f6',
        textSecondary: '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'auth-pattern': "radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.08), transparent)",
      }
    },
  },
  plugins: [],
}
