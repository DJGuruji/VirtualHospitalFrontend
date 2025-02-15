/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable dark mode via class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      resize: {
        both: "both",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".resize-both": {
          resize: "both",
        },
      });
    },
  ],
}
