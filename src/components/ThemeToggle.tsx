"use client";

import { useEffect, useState } from "react";

export type Theme = "terminal" | "pro" | "kawaii";
const THEMES: Theme[] = ["terminal", "pro", "kawaii"];
const STORAGE_KEY = "guild_theme";

const THEME_LABELS: Record<Theme, string> = {
  terminal: "Terminal",
  pro: "Pro",
  kawaii: "Kawaii",
};

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("terminal");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored && THEMES.includes(stored) ? stored : "terminal";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }

  return [theme, setTheme];
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  function cycle() {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  }

  return (
    <div
      role="radiogroup"
      aria-label="テーマ切替"
      className="flex items-center rounded-[var(--radius-md,4px)] overflow-hidden border border-divider text-[11px] font-mono"
    >
      {THEMES.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => setTheme(t)}
          className={`px-2 py-1 transition-colors duration-100 ${
            theme === t
              ? "bg-[var(--t-gold,#D4AF37)] text-obsidian font-bold"
              : "bg-obsidian-2 text-t-muted hover:text-t-text"
          }`}
        >
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  );
}

export function ThemeInitScript() {
  const script = `(function(){try{var t=localStorage.getItem('guild_theme');if(t&&['terminal','pro','kawaii'].includes(t)){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme','terminal');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
