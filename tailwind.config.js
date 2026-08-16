/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))", 
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        win: "hsl(var(--win))",
        loss: "hsl(var(--loss))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        // Inter and Roboto Mono were never loaded by index.html; the app has
        // always fallen back to Roboto / platform monospace. Say what ships:
        // Roboto for UI, IBM Plex Mono (loaded, weights 400-600) for figures.
        'sans': ['Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      // Console radius: one knob, three perceptible steps. Controls sit at
      // --radius (4px), surfaces at 1.5x (6px), micro chips at a fixed 2px.
      // The six Tailwind names stay valid so all existing call sites land
      // on the collapsed scale without per-site edits.
      borderRadius: {
        sm: "2px",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.5)",
        "2xl": "calc(var(--radius) * 1.5)",
        "3xl": "calc(var(--radius) * 1.5)",
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
