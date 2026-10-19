import { describe, expect, it } from "vitest";
import { parseFilters, search, toQuery } from "./query";
import type { Influencer } from "./types";

function kisi(handle: string, followers: number, quality: number | null): Influencer {
  return {
    handle, platform: "instagram", pool: "bagimsiz", display_name: null, followers, tier: "mikro", er: 2, er_posts: 6,
    segments: ["moda"], marketplaces: [], verified: false, bio: null, business_category: null, collection_url: null,
    brands: [], avatar: null, profile_url: "", first_seen_at: null,
    analysis: {
      quality: { score: quality, label: "", components: [] }, recent: [], rhythm: { per_week: null, last_post_at: null },
      mix: {}, reels_avg_views: null, paid_share: 0, partners: [], posts_measured: 6, followers_history: [],
      expected_er: null, highlights: [],
    },
  };
}

const HERKES = [kisi("orta", 30_000, 62), kisi("veri_yok", 90_000, null), kisi("yuksek", 20_000, 85), kisi("dusuk", 50_000, 30)];
const filtre = (p: Record<string, string>) => parseFilters(p, { moda: "Moda" }, ["mikro"]);

describe("rehber sorgusu: kitle kalitesi", () => {
  it("min_kalite altındaki ve puanı olmayan hesapları eler", () => {
    const r = search(HERKES, filtre({ min_kalite: "60" }));
    expect(r.rows.map((x) => x.handle)).toEqual(["orta", "yuksek"]);
  });

  it("kaliteye göre sıralar; 'Yetersiz veri' hesaplar sona", () => {
    const r = search(HERKES, filtre({ sirala: "kalite" }));
    expect(r.rows.map((x) => x.handle)).toEqual(["yuksek", "orta", "dusuk", "veri_yok"]);
  });

  it("analizi hiç olmayan hesap da sona düşer; puansızlar kendi aralarında takipçiye göre", () => {
    const analizsiz = { ...kisi("analizsiz", 1_000_000, null), analysis: null };
    const r = search([analizsiz, ...HERKES], filtre({ sirala: "kalite" }));
    expect(r.rows.map((x) => x.handle)).toEqual(["yuksek", "orta", "dusuk", "analizsiz", "veri_yok"]);
  });

  it("geçersiz ya da 100 üstü min_kalite yok sayılır", () => {
    expect(filtre({ min_kalite: "abc" }).minQuality).toBeNull();
    expect(filtre({ min_kalite: "150" }).minQuality).toBeNull();
  });

  it("bağlantıda filtreyi korur", () => {
    expect(toQuery(filtre({ min_kalite: "60", sirala: "kalite" }))).toBe("?min_kalite=60&sirala=kalite");
  });
});
