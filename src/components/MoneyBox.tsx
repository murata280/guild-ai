"use client";

import { useEffect, useRef, useState } from "react";
import { playCoinChime } from "@/lib/sound";

interface Props {
  /** total balance in JPY — when this increases, drop a coin */
  balance: number;
  /** label shown below the box */
  label?: string;
}

interface Coin {
  id: number;
  left: number; // 0-100 %
}

let coinId = 0;

export function MoneyBox({ balance, label = "おこづかいばこ" }: Props) {
  const prevBalance = useRef(balance);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (balance > prevBalance.current) {
      prevBalance.current = balance;

      // drop 1 coin
      const c: Coin = { id: ++coinId, left: 20 + Math.random() * 60 };
      setCoins((prev) => [...prev, c]);
      playCoinChime();

      // shake the box
      setShake(true);
      const shakeTimer = setTimeout(() => setShake(false), 400);

      // remove coin after animation ends (0.6s)
      const removeTimer = setTimeout(() => {
        setCoins((prev) => prev.filter((x) => x.id !== c.id));
      }, 650);

      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [balance]);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* coin drop arena */}
      <div
        className="relative w-20 h-20"
        aria-hidden
      >
        {coins.map((c) => (
          <span
            key={c.id}
            className="absolute top-0 text-base animate-coin-drop"
            style={{ left: `${c.left}%` }}
          >
            🪙
          </span>
        ))}

        {/* Piggy bank SVG */}
        <svg
          viewBox="0 0 80 80"
          className={`w-20 h-20 transition-transform ${shake ? "animate-box-shake" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={label}
          role="img"
        >
          {/* body */}
          <ellipse cx="38" cy="48" rx="26" ry="22" fill="#F4A261" />
          {/* head */}
          <circle cx="62" cy="38" r="12" fill="#F4A261" />
          {/* ear */}
          <ellipse cx="58" cy="27" rx="5" ry="4" fill="#E76F51" />
          <ellipse cx="58" cy="28" rx="3" ry="2.5" fill="#F4A261" />
          {/* snout */}
          <ellipse cx="72" cy="40" rx="6" ry="4" fill="#E76F51" />
          <circle cx="70.5" cy="39.5" r="1" fill="#3D1F0A" />
          <circle cx="73.5" cy="39.5" r="1" fill="#3D1F0A" />
          {/* eye */}
          <circle cx="65" cy="34" r="1.5" fill="#3D1F0A" />
          {/* coin slot */}
          <rect x="28" y="26" width="16" height="3" rx="1.5" fill="#3D1F0A" opacity="0.4" />
          {/* legs */}
          <rect x="18" y="66" width="8" height="8" rx="3" fill="#E76F51" />
          <rect x="30" y="66" width="8" height="8" rx="3" fill="#E76F51" />
          <rect x="42" y="66" width="8" height="8" rx="3" fill="#E76F51" />
          {/* tail */}
          <path d="M12 44 Q6 40 10 34 Q14 28 10 24" stroke="#E76F51" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <span className="text-xs text-zinc-400 font-medium">{label}</span>
    </div>
  );
}
