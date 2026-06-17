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
        surface: "hsl(var(--surface))",
        "surface-raised": "hsl(var(--surface-raised))",
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
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'Outfit', 'Poppins', 'Segoe UI', 'sans-serif'],
        'mono': ['"Roboto Mono"', 'Consolas', 'Monaco', 'monospace'],
      },
      borderRadius: {
        sm: "calc(var(--radius) * 0.5)",
        md: "calc(var(--radius) * 0.75)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.25)",
        "2xl": "calc(var(--radius) * 1.5)",
        "3xl": "calc(var(--radius) * 2)",
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
