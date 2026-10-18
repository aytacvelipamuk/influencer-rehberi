const compact = new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("tr-TR");

export const formatCount = (n: number | null) => (n === null ? "—" : compact.format(n));
export const formatWhole = (n: number) => whole.format(n);
export const formatEr = (er: number | null) =>
  er === null ? "—" : `%${er.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;

export const TIER_NAMES: Record<string, string> = {
  aday: "Aday (<1B)",
  nano: "Nano (1–10B)",
  mikro: "Mikro (10–50B)",
  orta: "Mid-tier (50–500B)",
  makro: "Makro (500B–1M)",
  mega: "Mega (1M+)",
};

export const MARKETPLACE_NAMES: Record<string, string> = {
  trendyol: "Trendyol",
  hepsiburada: "Hepsiburada",
  amazon: "Amazon",
  n11: "n11",
};

export const PLATFORM_NAMES = { instagram: "Instagram", tiktok: "TikTok" } as const;
export const POOL_NAMES = { trendyol: "Trendyol koleksiyonu var", bagimsiz: "Koleksiyonu yok" } as const;

/** Segment adındaki parantezli ek açıklamayı kısa etikette atar: "Aile & ebeveynlik (mommy)" → "Aile & ebeveynlik". */
export const shortSegment = (name: string) => name.replace(/\s*\(.*\)$/, "");
