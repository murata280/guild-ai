"use client";
import { useState, useRef } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = "" }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const isMobileRef = useRef(false);

  function handleMouseEnter() {
    if (!isMobileRef.current) setFlipped(true);
  }
  function handleMouseLeave() {
    if (!isMobileRef.current) setFlipped(false);
  }
  function handleClick() {
    // Only toggle on mobile (touch devices)
    if (isMobileRef.current) setFlipped((v) => !v);
  }
  function handleTouchStart() {
    isMobileRef.current = true;
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {/* aria-live for screen readers */}
      <div
        aria-live="polite"
        className="sr-only"
      >
        {flipped ? "裏面表示中" : ""}
      </div>

      <button
        aria-pressed={flipped}
        aria-label={flipped ? "カードの裏面を表示中。クリックで表面に戻す" : "カードの表面を表示中。クリックで裏面を見る"}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-kaki rounded-2xl"
        onClick={() => {
          isMobileRef.current = true;
          setFlipped((v) => !v);
        }}
        style={{ background: "none", border: "none", padding: 0 }}
      >
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front face */}
          <div
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            {front}
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {back}
          </div>
        </div>
      </button>
    </div>
  );
}
