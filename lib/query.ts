import type { Filters, Influencer, Platform, Pool, SortKey } from "./types";

export const PAGE_SIZE = 48;
const SORTS: SortKey[] = ["followers", "er", "kalite", "brands", "newest"];
const MAX_QUALITY = 100;
const PLATFORMS: Platform[] = ["instagram", "tiktok"];
const POOLS: Pool[] = ["trendyol", "bagimsiz"];

type Params = Record<string, string | string[] | undefined>;

function one(params: Params, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function positiveNumber(value: string): number | null {
  const n = Number(value.replace(",", "."));
  return value && Number.isFinite(n) && n >= 0 ? n : null;
}

const inRange = (n: number | null, max: number) => (n !== null && n <= max ? n : null);

/** Kitle kalitesi puanı; "Yetersiz veri" ya da analizi olmayan hesapta null. */
const qualityOf = (r: Influencer) => r.analysis?.quality.score ?? null;

/** URL'den gelen ham parametre → doğrulanmış filtre; geçersiz değer sessizce "yok" sayılır. */
export function parseFilters(params: Params, segments: Record<string, string>, tiers: string[]): Filters {
  const page = Math.max(1, Math.floor(positiveNumber(one(params, "sayfa")) ?? 1));
  return {
    q: one(params, "q").slice(0, 80),
    platform: oneOf(one(params, "platform"), PLATFORMS),
    pool: oneOf(one(params, "havuz"), POOLS),
    tier: oneOf(one(params, "basamak"), tiers),
    segment: oneOf(one(params, "kategori"), Object.keys(segments)),
    minEr: positiveNumber(one(params, "min_er")),
    minQuality: inRange(positiveNumber(one(params, "min_kalite")), MAX_QUALITY),
    brand: one(params, "marka").slice(0, 60) || null,
    sort: oneOf(one(params, "sirala"), SORTS) ?? "followers",
    page,
  };
}

/** Türkçe büyük/küçük harf ve aksan farkını yok sayan arama anahtarı. */
export function fold(text: string | null | undefined): string {
  return (text ?? "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");
}

function matches(r: Influencer, f: Filters, q: string, brand: string): boolean {
  if (f.platform && r.platform !== f.platform) return false;
  if (f.pool && r.pool !== f.pool) return false;
  if (f.tier && r.tier !== f.tier) return false;
  if (f.segment && !r.segments.includes(f.segment)) return false;
  if (f.minEr !== null && (r.er === null || r.er < f.minEr)) return false;
  if (f.minQuality !== null && (qualityOf(r) ?? -1) < f.minQuality) return false;
  if (brand && !r.brands.some((b) => fold(b).includes(brand))) return false;
  if (!q) return true;
  return [r.handle, r.display_name, r.bio, ...r.brands].some((t) => fold(t).includes(q));
}

const comparators: Record<SortKey, (a: Influencer, b: Influencer) => number> = {
  followers: (a, b) => (b.followers ?? -1) - (a.followers ?? -1),
  er: (a, b) => (b.er ?? -1) - (a.er ?? -1),
  kalite: (a, b) => (qualityOf(b) ?? -1) - (qualityOf(a) ?? -1) || (b.followers ?? -1) - (a.followers ?? -1),
  brands: (a, b) => b.brands.length - a.brands.length || (b.followers ?? -1) - (a.followers ?? -1),
  newest: (a, b) => (b.first_seen_at ?? "").localeCompare(a.first_seen_at ?? ""),
};

export function search(all: Influencer[], f: Filters) {
  const q = fold(f.q);
  const brand = fold(f.brand);
  const found = all.filter((r) => matches(r, f, q, brand)).sort(comparators[f.sort]);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  return { total: found.length, page, pages, rows: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

/** Filtre değiştiren bağlantılar için: mevcut filtreyi koruyup tek alanı değiştirir, sayfayı sıfırlar. */
export function toQuery(f: Filters, change: Partial<Record<string, string | null>> = {}): string {
  const base: Record<string, string | null> = {
    q: f.q || null,
    platform: f.platform,
    havuz: f.pool,
    basamak: f.tier,
    kategori: f.segment,
    min_er: f.minEr === null ? null : String(f.minEr),
    min_kalite: f.minQuality === null ? null : String(f.minQuality),
    marka: f.brand,
    sirala: f.sort === "followers" ? null : f.sort,
    sayfa: null,
  };
  const merged = { ...base, ...change };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
  const text = params.toString();
  return text ? `?${text}` : "";
}
