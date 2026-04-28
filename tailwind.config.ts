import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Updated to match reference site visual language
        kuroko: "#1A1628",        // 黒衣: dark purple-black (was #0F0F12)
        kaki: "#9B6BB5",          // 柿: brand purple (was #E8C46A gold)
        kami: "#F8F6F2",          // 紙: warm off-white (was #F5F2EA)
        "surface-inset": "#F2F0EB" // sidebar / inset surface
      },
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "Yu Gothic UI",
          "-apple-system",
          "system-ui",
          "sans-serif"
        ]
      },
      borderRadius: {
        card: "16px"
      },
      boxShadow: {
        card: "0px 1px 2px rgba(0,0,0,0.04), 0px 2px 6px rgba(0,0,0,0.03)",
        "card-hover": "0px 4px 12px rgba(0,0,0,0.10)"
      }
    }
  },
  plugins: []
};

export default config;
