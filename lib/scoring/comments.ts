/**
 * Yorum gerçekliği: etkileşim grupları (pod) ve bot yorumları kısa, genel ve tekrar eden olur.
 * Gerçek yorum soru sorar, deneyim anlatır, ürün adı geçirir — birkaç anlamlı kelime taşır.
 */
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}☀-➿️❤⭐‍]/gu;
const GENERIC_WORDS = new Set([
  "harika", "süper", "super", "çok güzel", "cok guzel", "güzel", "guzel", "muhteşem", "mükemmel",
  "bayıldım", "bayildim", "çok iyi", "tebrikler", "wow", "nice", "perfect", "love", "love it",
  "amazing", "beautiful", "cool", "great", "aynen", "bravo", "helal", "eyvallah", "katılıyorum",
]);
const MIN_REAL_WORDS = 4;

export function isGeneric(text: string | null): boolean {
  const clean = (text ?? "").replace(EMOJI_RE, " ").trim();
  if (!clean) return true;
  const plain = clean.replace(/[^\p{L}\p{N}\s]/gu, "").trim().toLocaleLowerCase("tr");
  if (GENERIC_WORDS.has(plain)) return true;
  return plain.split(/\s+/).filter(Boolean).length < MIN_REAL_WORDS;
}

export interface CommentQuality {
  comments_measured: number;
  authentic_share: number | null;
  repeat_share: number | null;
}

const share = (n: number, total: number) => (total ? Math.round((n / total) * 10_000) / 100 : null);

export function commentQuality(texts: string[]): CommentQuality {
  const normalized = texts.map((t) => (t ?? "").trim().toLocaleLowerCase("tr"));
  const counts = new Map<string, number>();
  for (const t of normalized) counts.set(t, (counts.get(t) ?? 0) + 1);
  return {
    comments_measured: texts.length,
    authentic_share: share(texts.filter((t) => !isGeneric(t)).length, texts.length),
    repeat_share: share(normalized.filter((t) => (counts.get(t) ?? 0) > 1).length, texts.length),
  };
}
