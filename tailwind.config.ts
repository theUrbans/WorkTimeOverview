import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        "text": "hsl(var(--text))",
        "background": "hsl(var(--background))",
        "primary": "hsl(var(--primary))",
        "secondary": "hsl(var(--secondary))",
        "accent": "hsl(var(--accent))",
      },
    },
  },
} satisfies Config;
