/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#ecfff6",100:"#d5ffec",200:"#aaf7d3",300:"#79eab8",400:"#40d895",
          500:"#12bf78",600:"#0b9c61",700:"#0a7a4f",800:"#075d3e",900:"#064b33",
        }
      },
      boxShadow: { soft: "0 2px 10px rgba(0,0,0,.06)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
}
