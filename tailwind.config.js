/** Build: npm run build  (see README.md) */
module.exports = {
  content: ['./index.html', './404.html', './assets/js/main.js'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        'surface-2': 'hsl(var(--surface-2))',
        'text-primary': 'hsl(var(--text))',
        muted: 'hsl(var(--muted))',
        stroke: 'hsl(var(--stroke))',
        brand: '#7f77dd',
        'brand-deep': '#534ab7',
        'brand-tint': '#eeedfe',
      },
    },
  },
  plugins: [],
};
