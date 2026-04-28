// Small formatting utilities shared across the app.

export const formatJPY = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(n);

export const isGithubUrl = (s: string): boolean => /^https?:\/\/github\.com\/[^/\s]+\/[^/\s]+/.test(s);
