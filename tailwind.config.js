/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        board: "#F7B500",   // kuning papan
        navy:  "#0D1B2A",   // biru navy
        off:   "#FFFFFF",   // putih
      },
      boxShadow: {
        board: "0 8px 0 rgba(0,0,0,0.12)",
      }
    },
  },
  plugins: [],
}
