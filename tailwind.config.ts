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
        kuroko: "#0F0F12", // 黒衣
        kaki: "#E8C46A",   // 柿
        kami: "#F5F2EA"    // 紙
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
