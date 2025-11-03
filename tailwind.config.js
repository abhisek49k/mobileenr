/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Background
        "background-primary": "rgb(var(--background-primary) / <alpha-value>)",
        "background-secondary": "rgb(var(--background-secondary) / <alpha-value>)",
        "background-icon": "rgb(var(--background-icon) / <alpha-value>)",

        // Text
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-icon": "rgb(var(--text-icon) / <alpha-value>)",
        "icon-primary": "rgb(var(--icon-primary) / <alpha-value>)",

        // Borders
        "border-primary": "rgb(var(--border-primary) / <alpha-value>)",
        "border-secondary": "rgb(var(--border-secondary) / <alpha-value>)",

        // Accent
        "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
        "accent-secondary": "rgb(var(--accent-secondary) / <alpha-value>)",

        // State Colors
        "error-primary": "rgb(var(--error-primary) / <alpha-value>)",
        "success-primary": "rgb(var(--success-primary) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}