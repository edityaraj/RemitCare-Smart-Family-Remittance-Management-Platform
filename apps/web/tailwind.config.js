/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1230", 50: "#EEF0F8", 900: "#050A1C" },
        emerald: { DEFAULT: "#10B981", 600: "#059669" },
      },
    },
  },
  plugins: [],
};
