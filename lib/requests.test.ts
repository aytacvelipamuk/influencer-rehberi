import { describe, expect, it } from "vitest";
import { cleanUtm, parseEmail, parseHandle, parseStoreUrl } from "./requests";

describe("parseStoreUrl", () => {
  it("reads the merchant id from a store path", () => {
    const r = parseStoreUrl("https://www.trendyol.com/magaza/ornek-magaza-m-123456?sst=0");
    expect(r).toEqual({ ok: true, value: { url: "https://www.trendyol.com/magaza/ornek-magaza-m-123456?sst=0", merchantId: "123456" } });
  });

  it("accepts a link without scheme and short or long merchant ids", () => {
    expect(parseStoreUrl("trendyol.com/magaza/a-m-12").ok).toBe(true);
    expect(parseStoreUrl("https://www.trendyol.com/sr?mid=1234567890").ok).toBe(true);
  });

  it("rejects other sites and product links", () => {
    expect(parseStoreUrl("https://www.hepsiburada.com/magaza/x-m-123").ok).toBe(false);
    expect(parseStoreUrl("https://www.trendyol.com/ornek-marka/urun-p-123").ok).toBe(false);
    expect(parseStoreUrl("https://evil.com/?trendyol.com/magaza/x-m-1234").ok).toBe(false);
  });
});

describe("cleanUtm", () => {
  it("keeps safe utm values and drops anything else", () => {
    expect(cleanUtm({ utm_source: "bulten", utm_medium: "<script>", utm_campaign: "influencer-rehberi", x: "y" }))
      .toEqual({ utm_source: "bulten", utm_campaign: "influencer-rehberi" });
  });
});

describe("parseEmail / parseHandle", () => {
  it("normalises valid input and rejects junk", () => {
    expect(parseEmail(" Ali@Ornek.com ")).toEqual({ ok: true, value: "ali@ornek.com" });
    expect(parseEmail("ali@ornek").ok).toBe(false);
    expect(parseHandle("@Ayse.K")).toEqual({ ok: true, value: "ayse.k" });
    expect(parseHandle("ayse k").ok).toBe(false);
  });
});
