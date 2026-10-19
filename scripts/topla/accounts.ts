/**
 * hesaplar.csv satırı → platform + hesap adı. Saf fonksiyon, testli.
 *   ayse.yilmaz | @ayse.yilmaz | https://www.instagram.com/ayse.yilmaz/   → Instagram
 *   tiktok:@ayse | https://www.tiktok.com/@ayse                           → TikTok
 */
import type { Platform } from "../../lib/types";

const HANDLE_RE = /^[a-z0-9._]{1,30}$/;
const TIKTOK_PREFIX_RE = /^tiktok:/i;
const TIKTOK_URL_RE = /^https?:\/\/(www\.|m\.)?tiktok\.com\/@/i;
const INSTAGRAM_URL_RE = /^https?:\/\/(www\.)?instagram\.com\//i;

export interface ParsedHandle {
  platform: Platform;
  handle: string;
}

export function parseHandle(raw: string): ParsedHandle | null {
  const v = raw.trim();
  const isTiktok = TIKTOK_PREFIX_RE.test(v) || TIKTOK_URL_RE.test(v);
  const handle = v
    .replace(TIKTOK_PREFIX_RE, "").replace(TIKTOK_URL_RE, "").replace(INSTAGRAM_URL_RE, "")
    .replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
  return HANDLE_RE.test(handle) ? { platform: isTiktok ? "tiktok" : "instagram", handle } : null;
}
