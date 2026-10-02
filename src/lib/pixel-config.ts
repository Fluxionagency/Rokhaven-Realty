// ─────────────────────────────────────────────────────────────────────────────
// Pixel configuration
// Replace the placeholder strings with your real pixel IDs before going live.
// These values are read by the CookieBanner component at runtime.
// ─────────────────────────────────────────────────────────────────────────────

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? 'REPLACE_WITH_META_PIXEL_ID';
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? 'REPLACE_WITH_TIKTOK_PIXEL_ID';

export function isMetaPixelConfigured(): boolean {
  return META_PIXEL_ID !== '' && !META_PIXEL_ID.startsWith('REPLACE_');
}

export function isTikTokPixelConfigured(): boolean {
  return TIKTOK_PIXEL_ID !== '' && !TIKTOK_PIXEL_ID.startsWith('REPLACE_');
}
