// Uydurma örnek veri: gerçek kişi yok. Site `npm run dev` ile kutudan çıktığı gibi açılsın diye.
// Kullanım: node scripts/ornek-veri-uret.mjs  → ornek-veri/influencers.json
import { mkdirSync, writeFileSync } from "node:fs";

const SEGMENTS = {
  moda: "Moda & aksesuar", guzellik_bakim: "Güzellik & bakım", anne_bebek: "Aile & ebeveynlik (mommy)",
  ev_yasam: "Ev & dekorasyon", yemek: "Yemek & mutfak", spor: "Fitness & spor", teknoloji: "Teknoloji",
};
const TIERS = [["aday", 0, 1000], ["nano", 1000, 10000], ["mikro", 10000, 50000], ["orta", 50000, 500000], ["makro", 500000, 1000000], ["mega", 1000000, null]];
const NAMES = ["Ece Yıldız", "Deniz Kaya", "Selin Aydın", "Mert Demir", "Zeynep Şahin", "Can Öztürk", "Elif Arslan", "Burak Koç",
  "Ayşe Polat", "Emre Çelik", "Nehir Kurt", "Kaan Yılmaz", "Defne Erdem", "Ozan Aksoy", "İpek Güneş", "Ada Korkmaz",
  "Arda Tekin", "Duru Bulut", "Efe Kılıç", "Lara Özkan", "Yağmur Taş", "Ege Doğan", "Melis Uçar", "Cem Aslan"];
const BRANDS = ["Örnek Kozmetik", "Kumaş & Co", "MiniAdım", "EvGüzel", "Lezzet Atölyesi", "FitHat", "TeknoKare", "Pamuk Bebe"];

let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const tierOf = (f) => TIERS.find(([, a, b]) => f >= a && (b === null || f < b))[0];
const slug = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

const influencers = NAMES.map((name, i) => {
  const followers = Math.round(2000 * Math.pow(10, rnd() * 3.2));
  const segs = [...new Set([pick(Object.keys(SEGMENTS)), pick(Object.keys(SEGMENTS))])];
  const brands = [...new Set(Array.from({ length: Math.floor(rnd() * 6) }, () => pick(BRANDS)))];
  const er = Math.round((0.4 + rnd() * 6) * 100) / 100;
  const handle = `ornek.${slug(name)}`;
  return {
    handle, platform: i % 5 === 4 ? "tiktok" : "instagram", pool: brands.length ? "trendyol" : "bagimsiz",
    display_name: name, followers, tier: tierOf(followers), er, er_posts: 12, segments: segs, marketplaces: ["trendyol"],
    verified: rnd() > 0.8, bio: `Örnek hesap · ${SEGMENTS[segs[0]].replace(/ \(.*\)/, "")} içerikleri. Gerçek kişi değildir.`,
    business_category: null, collection_url: null, brands, avatar: null,
    profile_url: `https://example.com/${handle}`, first_seen_at: "2026-10-01T00:00:00+00:00",
    analysis: {
      quality: { score: 50 + Math.round(rnd() * 45), label: "Örnek", components: [
        { key: "etkilesim", label: "Etkileşim / beklenen", max: 30, points: 22, value: 1.1, note: "Örnek bileşen" },
        { key: "oran", label: "Yorum / beğeni", max: 10, points: 10, value: 2.1, note: "Örnek bileşen" },
        { key: "takip", label: "Takip / takipçi", max: 10, points: 9, value: 0.3, note: "Örnek bileşen" }] },
      recent: ["Yeni sezon kombin önerileri", "Haftalık cilt bakımı rutinim", "Kutudan çıkanlar: bu ay denediklerim",
        "Mutfakta 10 dakikalık tarif", "Ev düzeni için küçük fikirler", "Takipçi soruları"].map((caption, j) => ({
        url: `https://example.com/p/${handle}-${j}`, kind: j % 2 ? "Carousel" : "Reel", thumb: null,
        likes: Math.round(followers * er / 100 * (0.7 + rnd() * 0.6)), comments: Math.round(followers * 0.001 + rnd() * 40),
        views: j % 2 ? null : Math.round(followers * (0.2 + rnd() * 0.6)), posted_at: `2026-10-${String(15 - j * 2).padStart(2, "0")}T10:00:00+00:00`,
        paid: j === 2, caption: `${caption} (örnek)` })),
      rhythm: { per_week: Math.round(rnd() * 50) / 10, last_post_at: "2026-10-15T10:00:00+00:00" },
      mix: { Reel: 6, Carousel: 4, Image: 2 }, reels_avg_views: Math.round(followers * 0.4), paid_share: Math.round(rnd() * 40),
      partners: [], posts_measured: 12, followers_history: [], expected_er: 2, highlights: [],
    },
  };
});

mkdirSync("ornek-veri", { recursive: true });
writeFileSync("ornek-veri/influencers.json", JSON.stringify({
  generated_at: "2026-10-18T12:00:00+00:00", count: influencers.length,
  labels: { segments: SEGMENTS, tiers: TIERS.map(([key, from, to]) => ({ key, from, to })) }, influencers,
}, null, 1));
console.log(`ornek-veri/influencers.json: ${influencers.length} uydurma hesap`);

// Örnek eşleşme raporu: /rapor/0123456789abcdef0123456789abcdef
const TOKEN = "0123456789abcdef0123456789abcdef";
const secilen = influencers.filter((r) => r.platform === "instagram").slice(0, 8);
const kanit = ["marka", "konu", "arama", "marka_zayif", "segment"];
mkdirSync("ornek-veri/raporlar", { recursive: true });
writeFileSync(`ornek-veri/raporlar/${TOKEN}.json`, JSON.stringify({
  token: TOKEN, created_at: "2026-10-18T12:00:00+00:00",
  store: { merchant_id: "000000", store_name: "Örnek Mağaza", categories: [{ name: "Cilt Bakımı", key: "cilt-bakimi", products: 12 }],
    brands: ["Örnek Kozmetik"], median_price: 349, product_count: 12, products: [] },
  scope: { key: null, title: "Güzellik & bakım" },
  competitors: BRANDS.slice(0, 5).map((b, i) => ({ brand: b, products: 40 - i * 6, influencers: 5 - i })),
  evidence_counts: { marka: 3, konu: 2, arama: 2, segment: 1 }, candidates: secilen.length,
  recommendations: secilen.map((r, i) => ({
    handle: r.handle, platform: r.platform, score: 85 - i * 5, evidence: kanit[i % kanit.length],
    reasons: ["Örnek gerekçe: rakip markayla çalışmış", `Etkileşim %${r.er}`, "Takipçi büyüklüğü mağazanın ölçeğine uygun"],
    warnings: [], brands: r.brands.slice(0, 2), followers: r.followers, tier: r.tier, er: r.er,
  })),
}, null, 1));
console.log(`ornek-veri/raporlar/${TOKEN}.json: örnek eşleşme raporu`);
