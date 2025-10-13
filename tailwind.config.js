/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta principal BodyForge (naranja)
        forge: {
          50:  "#fff7f0",
          100: "#ffead6",
          200: "#ffd2ad",
          300: "#ffb97f",
          400: "#ff9d4d",
          500: "#ff7f0e", // principal
          600: "#e56f06",
          700: "#bf5d07",
          800: "#984809",
          900: "#6b3407",
        },
        // Grises neutros para UI clara
        neutral: {
          50:"#f8fafb",
          100:"#f1f5f7",
          200:"#e5eaef",
          300:"#d5dbe3",
          400:"#b9c1cd",
          500:"#98a0ad",
          600:"#788090",
          700:"#586173",
          800:"#3e4657",
          900:"#222838",
        },
      },
      boxShadow: {
        soft: "0 6px 20px rgba(17, 24, 39, 0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
      backgroundImage: {
        'hero-forge': 'linear-gradient(90deg, #fff2e6 0%, #ffe7d3 50%, #ffd8b7 100%)',
      }
    },
  },
  plugins: [],
}
