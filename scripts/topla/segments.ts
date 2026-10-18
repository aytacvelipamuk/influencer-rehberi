/**
 * Basit kategori sınıflandırıcı: bio ve gönderi metinlerinde anahtar kelime sayımı (en çok 3 kategori).
 * Kendi kategorilerinizi buraya ekleyin; hesaplar.csv'de kategori verirseniz bu atlanır.
 */
export const SEGMENT_NAMES: Record<string, string> = {
  moda: "Moda & aksesuar", guzellik_bakim: "Güzellik & bakım", anne_bebek: "Aile & ebeveynlik (mommy)",
  ev_yasam: "Ev & dekorasyon", yemek: "Yemek & mutfak", spor: "Fitness & spor", teknoloji: "Teknoloji",
  seyahat: "Seyahat", evcil: "Evcil hayvan", lifestyle: "Lifestyle",
};

const KEYWORDS: Record<string, string[]> = {
  moda: ["kombin", "outfit", "elbise", "moda", "stil", "fashion", "ayakkabı", "çanta"],
  guzellik_bakim: ["makyaj", "cilt", "skincare", "ruj", "serum", "bakım", "parfüm", "saç"],
  anne_bebek: ["bebek", "anne", "hamile", "çocuk", "mom", "oğlum", "kızım"],
  ev_yasam: ["dekor", "ev ", "salon", "mutfak düzen", "home", "organizasyon"],
  yemek: ["tarif", "yemek", "lezzet", "recipe", "tatlı", "pasta"],
  spor: ["fitness", "spor", "antrenman", "pilates", "koşu", "gym"],
  teknoloji: ["teknoloji", "telefon", "kulaklık", "unboxing", "tech", "oyun"],
  seyahat: ["seyahat", "tatil", "travel", "otel", "gezi"],
  evcil: ["kedi", "köpek", "pati", "pet"],
};
const MAX_SEGMENTS = 3;
const MIN_HITS = 2;

export function classify(text: string): string[] {
  const t = ` ${text.toLocaleLowerCase("tr")} `;
  const hits = Object.entries(KEYWORDS)
    .map(([seg, words]) => [seg, words.reduce((s, w) => s + (t.split(w).length - 1), 0)] as const)
    .filter(([, n]) => n >= MIN_HITS)
    .sort((a, b) => b[1] - a[1]);
  return hits.length ? hits.slice(0, MAX_SEGMENTS).map(([s]) => s) : ["lifestyle"];
}
