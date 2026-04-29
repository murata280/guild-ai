"use client";

import { useState, useRef, useEffect, useId } from "react";

interface HelpHintProps {
  content: string;
  label?: string;
}

export function HelpHint({ content, label = "?" }: HelpHintProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    }
    function handleClick(e: MouseEvent) {
      if (!popRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="ヘルプを表示"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#9890A8]/40 bg-[#F4F4F5] text-[10px] font-bold text-[#9890A8] hover:border-kaki hover:text-kaki transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kaki/40"
      >
        {label}
      </button>

      {open && (
        <div
          ref={popRef}
          id={id}
          role="tooltip"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-56 rounded-xl bg-kuroko px-3 py-2.5 text-xs leading-relaxed text-white shadow-xl"
          style={{ boxShadow: "0 4px 20px rgba(26,22,40,0.22)" }}
        >
          {content}
          {/* Tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-kuroko rotate-45" aria-hidden />
        </div>
      )}
    </span>
  );
}
