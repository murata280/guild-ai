// SSR-safe localStorage wrapper for user-uploaded asset photos.
// Returns null on server; reads/writes only on client.

const KEY_PREFIX = "guild_photo_";

export function getPhoto(assetId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${KEY_PREFIX}${assetId}`);
}

export function setPhoto(assetId: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${KEY_PREFIX}${assetId}`, dataUrl);
}

export function removePhoto(assetId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${KEY_PREFIX}${assetId}`);
}
