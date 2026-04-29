# Mascot Placement Rules

This document defines where the Shimaenaga mascot and AssetSpirit components may
and may not appear, and what ARIA labels each mode must carry.

---

## Placement Whitelist

The following pages/components are approved placements for `<Shimaenaga>`:

| Location | Mode | Purpose |
|----------|------|---------|
| `src/app/asset/[id]/page.tsx` — TrustPanel area | `avatar` | Trust signal beside listing |
| `src/components/ClaimFlow.tsx` — instructions step | `guardian` | Guides the creator through claim |
| `src/components/ClaimFlow.tsx` — verifying step | `guardian` | Animated guard during verification |
| Any "success" confirmation screen | `seal` | Certification stamp on completion |

---

## Prohibited Placements

| Location | Reason |
|----------|--------|
| `src/app/marketplace/page.tsx` | Product grid — mascot distracts from listings |
| `src/app/showcase/page.tsx` | Showcase — mascot must not appear in product cards |
| `src/app/asset/[id]/page.tsx` (product card area) | AssetSpirit prohibited here |
| `src/components/ProToggle.tsx` | UI control — no decorative mascots in controls |

These restrictions are enforced by `src/lib/__tests__/mascot-placement.test.ts`.

---

## Pro Mode Suppression

When `proMode` is `true` in the wallet page, decorative animations may be
suppressed for performance. The `<Shimaenaga>` component already respects
`@media (prefers-reduced-motion: no-preference)` for the avatar blink animation.

---

## ARIA Label Requirements by Mode

Each Shimaenaga mode must include a suffix in its `aria-label`:

| Mode | Required suffix (Japanese or English) |
|------|---------------------------------------|
| `avatar` | `（アバターモード）` |
| `seal` | `（認証スタンプ）` — must contain 認証スタンプ / stamp / seal |
| `guardian` | `（ガーディアン守り神）` — must contain ガーディアン / 守り神 / guard |

---

## Test Coverage

`src/lib/__tests__/mascot-placement.test.ts` verifies:

- AssetSpirit absent from marketplace, showcase, and asset-detail pages
- `<Shimaenaga` absent from marketplace and showcase pages
- `<Shimaenaga` absent from ProToggle
- guardian mode aria-label contains ガーディアン / 守り神 / guard
- seal mode aria-label contains 認証スタンプ / stamp / seal
- guardian mode renders `GuardianShield` path
- seal mode renders "GUILD CERTIFIED" text
- avatar mode has `shima-eye-blink` animation class
- `prefers-reduced-motion` is respected in avatar blink
