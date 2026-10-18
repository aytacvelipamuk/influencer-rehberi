import { describe, expect, it } from "vitest";
import { scoreMatch, storeSize } from "./match";

const base = { evidence: "marka" as const, brands: ["Marka A", "Marka B"], er: null, tier: null, pool: null };

describe("eşleşme puanı", () => {
  it("kanıt gücünü ve markaları gerekçeye yazar", () => {
    const r = scoreMatch(base, "small");
    expect(r.score).toBe(45);
    expect(r.reasons[0]).toBe("Kapsam markasıyla iş birliği: Marka A, Marka B");
    expect(r.warnings).toEqual([]);
  });

  it("etkileşimi %6'da tavanlar (25 puan)", () => {
    expect(scoreMatch({ ...base, er: 3 }, "small").score).toBe(57.5);
    expect(scoreMatch({ ...base, er: 12 }, "small").score).toBe(70);
  });

  it("sessiz kitleyi cezalandırır: %0,5 altı −20 ve uyarı", () => {
    const r = scoreMatch({ ...base, er: 0.2 }, "small");
    expect(r.score).toBe(25.8);
    expect(r.warnings[0]).toMatch(/Etkileşim düşük/);
  });

  it("imkânsız E.R.'yi (%25 üstü) puana katmaz, işaretler", () => {
    const r = scoreMatch({ ...base, er: 122 }, "small");
    expect(r.score).toBe(45);
    expect(r.warnings[0]).toMatch(/ölçüm hatası/);
    expect(r.reasons.some((x) => x.startsWith("Etkileşim"))).toBe(false);
  });

  it("basamak uyumu mağaza ölçeğine göre değişir", () => {
    const mikro = { ...base, evidence: "segment" as const, tier: "mikro" };
    const mega = { ...mikro, tier: "mega" };
    expect(scoreMatch(mikro, "small").score).toBe(28);
    expect(scoreMatch(mikro, "large").score).toBe(20);
    expect(scoreMatch(mega, "small").score).toBe(8);
    expect(scoreMatch(mega, "large").score).toBe(16);
    expect(scoreMatch(mikro, "small").reasons).toContain("Takipçi büyüklüğü mağazanın ölçeğine uygun");
  });

  it("Trendyol koleksiyonuna 10 puan ekler", () => {
    expect(scoreMatch({ ...base, pool: "trendyol" }, "small").score).toBe(55);
  });

  it("mağaza ölçeğini ürün sayısından çıkarır", () => {
    expect(storeSize(12)).toBe("small");
    expect(storeSize(50)).toBe("large");
  });
});
