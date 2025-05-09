/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
          light: '#81C784'
        },
        secondary: {
          DEFAULT: '#2196F3',
          dark: '#1976D2',
          light: '#64B5F6'
        },
        accent: {
          DEFAULT: '#FFC107',
          dark: '#FFA000',
          light: '#FFD54F'
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#4CAF50",
          "primary-focus": "#388E3C",
          secondary: "#2196F3",
          "secondary-focus": "#1976D2",
          accent: "#FFC107",
          "accent-focus": "#FFA000",
          "base-100": "#F9F9F9",
          "base-200": "#FFFFFF",
          "base-content": "#212121",
        },
      },
    ],
    darkTheme: "dark",
  },
};
