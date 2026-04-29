"use client";
import { useState, useEffect, useRef } from "react";

export function useLazyMount(delay = 200): { ref: React.RefObject<HTMLDivElement>; mounted: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timer = setTimeout(() => setMounted(true), delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, mounted };
}
