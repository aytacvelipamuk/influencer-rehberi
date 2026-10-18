// Ziyaretçi talepleri (eşleştirme, kaldırma) için doğrulama — saf fonksiyonlar, testli.

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
// trendyol.com/magaza/<ad>-m-<id> ya da ?merchantId=<id> / ?mid=<id>
const STORE_PATH_RE = /^\/magaza\/[^/]+-m-(\d{2,12})\/?$/i;
const MERCHANT_PARAMS = ["merchantId", "mid"];
const MERCHANT_ID_RE = /^\d{2,12}$/;
const HANDLE_RE = /^@?([a-z0-9._]{1,30})$/i;
const NOTE_MAX = 500;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseEmail(raw: unknown): Result<string> {
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return EMAIL_RE.test(email) ? { ok: true, value: email } : { ok: false, error: "Geçerli bir e-posta adresi yaz." };
}

/** Trendyol mağaza linkinden satıcı kimliği (merchantId). Satıcı ID'si 2-10+ hane olabilir, uzunluk sabitlenmez. */
export function parseStoreUrl(raw: unknown): Result<{ url: string; merchantId: string }> {
  const fail = { ok: false as const, error: "Trendyol mağaza linkini yapıştır (ör. trendyol.com/magaza/ornek-m-123456)." };
  if (typeof raw !== "string" || raw.length > 400) return fail;
  let url: URL;
  try {
    url = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return fail;
  }
  if (!/(^|\.)trendyol\.com$/i.test(url.hostname)) return fail;
  const fromPath = STORE_PATH_RE.exec(url.pathname)?.[1];
  const fromQuery = MERCHANT_PARAMS.map((p) => url.searchParams.get(p)).find((v) => v && MERCHANT_ID_RE.test(v));
  const merchantId = fromPath ?? fromQuery;
  if (!merchantId) return fail;
  return { ok: true, value: { url: `${url.origin}${url.pathname}${url.search}`, merchantId } };
}

export function parseHandle(raw: unknown): Result<string> {
  const m = typeof raw === "string" ? HANDLE_RE.exec(raw.trim()) : null;
  return m ? { ok: true, value: m[1].toLowerCase() } : { ok: false, error: "Hesap adını @ile ya da @'siz yaz." };
}

export const cleanNote = (raw: unknown) => (typeof raw === "string" ? raw.trim().slice(0, NOTE_MAX) : "");
