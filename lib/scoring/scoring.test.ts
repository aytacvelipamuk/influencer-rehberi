import { describe, expect, it } from "vitest";
import {
  commentQuality, commentRatioComponent, consistencyComponent, engagementComponent, engagementRate,
  followingComponent, growthComponent, isGeneric, rhythm, score, tier,
} from "./index";

describe("etkileşim", () => {
  it("gönderi başına oranların medyanını alır (tek viral gönderi şişirmez)", () => {
    const posts = [{ likes: 100, comments: 0 }, { likes: 200, comments: 0 }, { likes: 9000, comments: 0 }];
    expect(engagementRate(posts, 10_000)).toBe(2);
  });

  it("takipçi basamağını HypeAuditor tanımıyla verir", () => {
    expect(tier(9_999)).toBe("nano");
    expect(tier(50_000)).toBe("orta");
    expect(tier(null)).toBeNull();
  });

  it("haftalık paylaşım ritmini hesaplar", () => {
    expect(rhythm(["2026-10-01", "2026-10-08", "2026-10-15"]).per_week).toBe(1);
  });
});

describe("yorum gerçekliği", () => {
  it("kısa övgüyü ve emojiyi jenerik sayar, deneyim anlatan yorumu saymaz", () => {
    expect(isGeneric("Harika!! 😍")).toBe(true);
    expect(isGeneric("Bu serumu kuru ciltte de kullanabilir miyim?")).toBe(false);
  });

  it("tekrar eden yorumları sayar", () => {
    expect(commentQuality(["süper", "süper", "Bunu nereden aldın, beden kalıbı nasıl?"]).repeat_share).toBeCloseTo(66.67, 1);
  });
});

describe("kitle kalitesi", () => {
  it("bandın çok üstündeki etkileşimi ödüllendirmez, işaretler", () => {
    expect(engagementComponent(2.5, 50_000)!.points).toBe(30);
    expect(engagementComponent(12, 50_000)!.note).toContain("etkileşim grubu");
  });

  it("aşırı uçlardaki yorum/beğeni oranı puan kaybettirir", () => {
    expect(commentRatioComponent(10_000, 5)!.points).toBeLessThan(5);
    expect(commentRatioComponent(1_000, 20)!.points).toBe(10);
  });

  it("takip-geri takip hesapları, sıçramalar ve düz beğeni işaretlenir", () => {
    expect(followingComponent(20_000, 10_000)!.points).toBe(0);
    expect(growthComponent([10_000, 13_000])!.points).toBeLessThan(10);
    expect(consistencyComponent([1000, 1010, 995, 1005])!.points).toBeLessThan(10);
  });

  it("az sinyalden puan uydurmaz; olan bileşenlere ölçekler", () => {
    expect(score([followingComponent(200, 10_000), null]).score).toBeNull();
    const r = score([followingComponent(200, 10_000), commentRatioComponent(1_000, 20), consistencyComponent([400, 2500, 900, 1200])]);
    expect(r.score).toBe(100);
    expect(r.label).toBe("Yüksek");
  });
});
