import { describe, expect, it } from "vitest";
import { parseHandle } from "./accounts";

describe("hesap satırı ayrıştırma", () => {
  it("Instagram adını, @'lı yazımı ve adresi tanır", () => {
    expect(parseHandle("Ayse.Yilmaz")).toEqual({ platform: "instagram", handle: "ayse.yilmaz" });
    expect(parseHandle("@ayse")).toEqual({ platform: "instagram", handle: "ayse" });
    expect(parseHandle("https://www.instagram.com/ayse/?hl=tr")).toEqual({ platform: "instagram", handle: "ayse" });
  });

  it("TikTok'u önekten ve adresten tanır", () => {
    expect(parseHandle("tiktok:@ayse_tt")).toEqual({ platform: "tiktok", handle: "ayse_tt" });
    expect(parseHandle("TikTok:ayse_tt")).toEqual({ platform: "tiktok", handle: "ayse_tt" });
    expect(parseHandle("https://www.tiktok.com/@ayse_tt?lang=tr")).toEqual({ platform: "tiktok", handle: "ayse_tt" });
  });

  it("geçersiz adı reddeder", () => {
    expect(parseHandle("ayşe yılmaz")).toBeNull();
    expect(parseHandle("tiktok:")).toBeNull();
  });
});
