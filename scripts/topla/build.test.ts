import { describe, expect, it } from "vitest";
import { type Account, addPost, addProfile, addReel, toInfluencer } from "./build";
import { classify } from "./segments";

const PROFIL = {
  account: "Ornek.Hesap", profile_name: "Örnek Hesap", followers: 40_000, following: 300, is_verified: true,
  biography: "Cilt bakımı ve makyaj önerileri", profile_image_link: "https://cdn/a.jpg",
  posts: [{ id: "1", caption: "serum rutini", datetime: "2026-10-10T00:00:00Z", image_url: "https://cdn/1.jpg", content_type: "Carousel", url: "u1" }],
  highlights: [{ id: "h1", title: "favoriler", image: "https://cdn/h.jpg", highlight_url: "hu" }],
};

function hesap(): Account {
  const acc = new Map<string, Account>();
  addProfile(acc, PROFIL);
  for (let i = 1; i <= 4; i++) {
    addPost(acc, { user_posted: "ornek.hesap", post_id: String(i), url: `u${i}`, content_type: i % 2 ? "Carousel" : "Reel",
      description: i === 2 ? "#işbirliği ile yeni ruj" : "günlük cilt bakımı", likes: 600 + i * 300, num_comments: 20,
      date_posted: `2026-10-${10 + i}T00:00:00Z`, latest_comments: [{ comments: "Bu ruj kuru dudakta da kalıcı mı acaba?" }, { comments: "süper" }] });
  }
  addReel(acc, { user_posted: "ornek.hesap", post_id: "2", views: 25_000, likes: 3 });
  return acc.get("ornek.hesap")!;
}

describe("toplayıcı dönüştürücüsü", () => {
  it("profil, gönderi ve Reels satırlarını tek hesapta birleştirir; Reels beğenisini kullanmaz", () => {
    const a = hesap();
    expect(a.posts.size).toBe(4);
    expect(a.posts.get("2")).toMatchObject({ views: 25_000, likes: 1200, paid: true });
  });

  it("sitenin okuduğu kaydı üretir: basamak, E.R., analiz", () => {
    const r = toInfluencer(hesap(), { thumbs: { "4": "posts/4.jpg" } }, "2026-10-18T00:00:00Z");
    expect(r).toMatchObject({ handle: "ornek.hesap", tier: "mikro", verified: true, display_name: "Örnek Hesap" });
    expect(r.er).toBeGreaterThan(2);
    expect(r.analysis!.recent[0]).toMatchObject({ url: "u4", thumb: "posts/4.jpg" });
    expect(r.analysis!.reels_avg_views).toBe(25_000);
    expect(r.analysis!.paid_share).toBe(25);
    expect(r.segments).toContain("guzellik_bakim");
  });

  it("hatalı (kapalı hesap) satırları atlar", () => {
    const acc = new Map<string, Account>();
    addProfile(acc, { account: "kapali", error_code: "dead_page" });
    expect(acc.size).toBe(0);
  });

  it("kategori bulamazsa lifestyle der", () => {
    expect(classify("merhaba dünya")).toEqual(["lifestyle"]);
  });
});
