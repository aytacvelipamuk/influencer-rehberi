/**
 * Basit kategori sınıflandırıcı: bio ve gönderi metinlerinde anahtar kelime sayımı (en çok 3 kategori).
 * Kendi kategorilerinizi buraya ekleyin; hesaplar.csv'de kategori verirseniz bu atlanır.
 */
export const SEGMENT_NAMES: Record<string, string> = {
  moda: "Moda & aksesuar", guzellik_bakim: "Güzellik & bakım", anne_bebek: "Aile & ebeveynlik (mommy)",
  ev_yasam: "Ev & dekorasyon", yemek: "Yemek & mutfak", spor: "Fitness & spor", teknoloji: "Teknoloji",
  seyahat: "Seyahat", evcil: "Evcil hayvan", lifestyle: "Lifestyle",
};

/**
 * Anahtar kelimeler kelime BAŞINDA aranır: "elbise" → "elbiseler" eşleşir, "ödev" içindeki "ev" eşleşmez.
 * SHORT_WORD_MAX harfe kadar kısa kelimeler ("ev", "pet", "spf") yalnız tam kelimeyse sayılır.
 */
const KEYWORDS: Record<string, string[]> = {
  moda: ["kombin", "outfit", "elbise", "moda", "stil", "fashion", "ayakkabı", "çanta", "etek", "ceket", "gömlek",
    "tesettür", "abiye", "aksesuar", "takı", "ootd", "style", "dress", "sneaker", "jewelry"],
  guzellik_bakim: ["makyaj", "cilt", "skincare", "ruj", "serum", "bakım", "parfüm", "saç", "fondöten", "nemlendirici",
    "spf", "güneş kremi", "maskara", "allık", "kapatıcı", "tonik", "makeup", "beauty", "lipstick", "foundation"],
  anne_bebek: ["bebek", "anne", "hamile", "çocuk", "mom", "oğlum", "kızım", "emzir", "lohusa", "doğum", "annelik",
    "kreş", "baby", "newborn", "toddler", "pregnan", "motherhood", "kids"],
  ev_yasam: ["dekor", "ev", "salon", "mutfak düzen", "home", "organizasyon", "mobilya", "nevresim", "perde",
    "halı", "tadilat", "yatak odası", "interior", "decor", "cozy", "diy"],
  yemek: ["tarif", "yemek", "lezzet", "recipe", "tatlı", "pasta", "kahvaltı", "mutfak", "fırın", "çorba", "salata",
    "hamur", "kek", "food", "cooking", "baking", "dessert", "foodie"],
  spor: ["fitness", "spor", "antrenman", "pilates", "koşu", "gym", "yoga", "kas", "protein", "egzersiz", "maraton",
    "kardiyo", "workout", "training", "running", "athlete", "crossfit"],
  teknoloji: ["teknoloji", "telefon", "kulaklık", "unboxing", "tech", "oyun", "bilgisayar", "laptop", "tablet",
    "akıllı saat", "kamera", "smartphone", "gadget", "gaming", "setup", "iphone", "android"],
  seyahat: ["seyahat", "tatil", "travel", "otel", "gezi", "rota", "kamp", "uçak", "vize", "plaj", "trip", "hotel",
    "vacation", "wanderlust", "backpack"],
  evcil: ["kedi", "köpek", "pati", "pet", "mama", "veteriner", "kumu", "yavru", "cat", "dog", "puppy", "kitten"],
};
const MAX_SEGMENTS = 3;
const MIN_HITS = 2;
const SHORT_WORD_MAX = 3;

const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Kelime başı sınırı + kısa kelimelerde kelime sonu sınırı. */
function pattern(word: string): RegExp {
  const end = word.length <= SHORT_WORD_MAX ? "(?!\\p{L})" : "";
  return new RegExp(`(?<![\\p{L}\\p{N}])${escape(word)}${end}`, "gu");
}

const PATTERNS: [string, RegExp[]][] = Object.entries(KEYWORDS).map(([seg, words]) => [seg, words.map(pattern)]);

export function classify(text: string): string[] {
  const t = text.toLocaleLowerCase("tr");
  const hits = PATTERNS
    .map(([seg, res]) => [seg, res.reduce((s, re) => s + (t.match(re)?.length ?? 0), 0)] as const)
    .filter(([, n]) => n >= MIN_HITS)
    .sort((a, b) => b[1] - a[1]);
  return hits.length ? hits.slice(0, MAX_SEGMENTS).map(([s]) => s) : ["lifestyle"];
}
