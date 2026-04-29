// GUILD AI — Symbolic Icon Set
// All inline SVG, zero external dependencies.
// Size defaults to 1em (inherits from text-size context).

interface IconProps {
  className?: string;
  size?: number;
  title?: string;
}

function Icon({ size = 16, className = "", title, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// ─── Rank icons ────────────────────────────────────────────────────────────────

export function CrownIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "最高ランク（S）"}>
      <path d="M2 19h20M4 19l2-8 6 5 6-5 2 8" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="4" cy="11" r="1.5" />
      <circle cx="20" cy="11" r="1.5" />
    </Icon>
  );
}

export function StarIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "高評価ランク（A）"}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Icon>
  );
}

export function LeafIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "標準ランク（B）"}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Icon>
  );
}

// ─── Section icons ─────────────────────────────────────────────────────────────

export function PackageIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "登録"}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </Icon>
  );
}

export function SearchIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "評価"}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

export function ShoppingBagIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "マーケット"}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Icon>
  );
}

export function UserIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "マイページ"}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

export function BanknoteIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "収益明細"}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </Icon>
  );
}

export function LinkIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "AI連携窓口"}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  );
}

export function ChevronDownIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function CodeIcon({ className, size, title }: IconProps) {
  return (
    <Icon size={size} className={className} title={title ?? "技術詳細"}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Icon>
  );
}
