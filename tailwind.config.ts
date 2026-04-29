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
        kuroko: "#1A1628",             // 黒衣: dark purple-black
        kaki: "#1A6BB5",              // JPYC blue (primary accent)
        "accent-green": "#0FA968",    // success / payout highlight
        kami: "#FAFAFA",              // neutral off-white
        "surface-inset": "#F4F4F5",   // sidebar / inset surface
      },
      fontFamily: {
        sans: ["var(--font-noto-jp)", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", "sans-serif"]
      },
      borderRadius: {
        card: "16px",
        sm:    "6px",
        DEFAULT: "8px",
        md:    "10px",
        lg:    "14px",
        xl:    "18px",
        "2xl": "22px",
        "3xl": "28px",
        full:  "9999px",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.22, 1, 0.36, 1)",
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
