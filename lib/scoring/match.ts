/**
 * Eşleşme puanı (rapor) — saf fonksiyon. Yöntem: docs/YONTEM.md "Eşleşme puanı".
 * Puan = kanıt gücü + etkileşim + mağaza ölçeğine uygun basamak + koleksiyon. Ücret kullanılmaz.
 * Her puan gerekçeleri ve uyarılarıyla döner; raporda bileşenleri gösterilmeden puan yazılmaz.
 */
export type Evidence = "marka" | "konu" | "arama" | "marka_zayif" | "segment";
export type StoreSize = "small" | "large";

export const EVIDENCE_POINTS: Record<Evidence, number> = { marka: 45, konu: 35, arama: 25, marka_zayif: 15, segment: 8 };
export const EVIDENCE_LABELS: Record<Evidence, string> = {
  marka: "Kapsam markasıyla iş birliği",
  marka_zayif: "Genel markayla iş birliği",
  konu: "Konu paylaşımı",
  arama: "Kategori araması",
  segment: "Segment adayı",
};
export const ER_FULL = 6;               // %6 ve üstü tam puan
export const ER_POINTS = 25;
export const ER_LOW = 0.5;              // altı: kitle tepki vermiyor
export const ER_LOW_PENALTY = 20;
export const ER_MAX_CREDIBLE = 25;      // üstü ölçüm hatası (ör. %122): puana girmez
export const COLLECTION_POINTS = 10;
export const SMALL_STORE_PRODUCTS = 50;
export const TIER_FIT: Record<StoreSize, Record<string, number>> = {
  small: { nano: 15, mikro: 20, orta: 15, makro: 5, mega: 0, aday: 2 },
  large: { nano: 5, mikro: 12, orta: 20, makro: 15, mega: 8, aday: 0 },
};
const TIER_FIT_REASON_MIN = 15;
const MAX_REASON_BRANDS = 3;

export interface MatchCandidate {
  evidence: Evidence;
  brands?: string[];
  er: number | null;
  tier: string | null;
  /** "trendyol" = Trendyol koleksiyonu var. */
  pool: string | null;
}

export interface MatchScore {
  score: number;
  reasons: string[];
  warnings: string[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (n: number, digits: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: digits });

export function storeSize(productCount: number): StoreSize {
  return productCount < SMALL_STORE_PRODUCTS ? "small" : "large";
}

function engagementPart(er: number | null): MatchScore {
  if (er === null) return { score: 0, reasons: [], warnings: [] };
  if (er > ER_MAX_CREDIBLE) {
    return { score: 0, reasons: [], warnings: [`Etkileşim oranı (%${pct(er, 0)}) ölçüm hatası olabilir, puana katılmadı`] };
  }
  const points = round1(Math.min(er, ER_FULL) / ER_FULL * ER_POINTS);
  const reasons = [`Etkileşim %${pct(er, 1)}`];
  if (er >= ER_LOW) return { score: points, reasons, warnings: [] };
  return {
    score: points - ER_LOW_PENALTY,
    reasons,
    warnings: [`Etkileşim düşük (%${pct(er, 1)}): takipçi çok ama paylaşımlara tepki az`],
  };
}

export function scoreMatch(c: MatchCandidate, size: StoreSize): MatchScore {
  const brands = c.brands?.length ? `: ${c.brands.slice(0, MAX_REASON_BRANDS).join(", ")}` : "";
  const eng = engagementPart(c.er);
  const fit = (c.tier && TIER_FIT[size][c.tier]) || 0;
  const isCollection = c.pool === "trendyol";
  const score = EVIDENCE_POINTS[c.evidence] + eng.score + fit + (isCollection ? COLLECTION_POINTS : 0);
  return {
    score: round1(score),
    reasons: [
      EVIDENCE_LABELS[c.evidence] + brands,
      ...eng.reasons,
      ...(fit >= TIER_FIT_REASON_MIN ? ["Takipçi büyüklüğü mağazanın ölçeğine uygun"] : []),
      ...(isCollection ? ["Trendyol koleksiyonu var: ürünü doğrudan koleksiyonuna ekleyebilir"] : []),
    ],
    warnings: eng.warnings,
  };
}
