/**
 * Arayüz metinleri (Türkçe). Başka dile çevirmek için bu dosyayı kopyalayın (ör. en.ts) ve `Metinler` türüne uydurun.
 * Şimdilik site çerçevesi (üst menü, altbilgi), filtre çubuğu ve rehber sayfası buradan okur; diğer sayfalar sırayla taşınacak.
 * Pazaryeri adı geçen metinler için bkz. docs/UYARLAMA.md.
 */
export const tr = {
  site: {
    name: "Influencer Rehberi",
  },
  header: {
    directory: "Rehber",
    howTo: "Nasıl kullanılır",
    matchShort: "Eşleştir",
    matchLong: "Mağazama uygun olanlar",
  },
  footer: {
    about: "Trendyol satıcılarının doğru içerik üreticisini bulması için ücretsiz rehber.",
    operatedBy: (name: string) => ` ${name} tarafından işletilir.`,
    updated: (date: string) => `Herkese açık profillerden derlenir. Son güncelleme: ${date}.`,
    directory: "Rehber",
    matchReport: "Eşleşme raporu",
    method: "Nasıl ölçüyoruz",
    openSource: "Açık kaynak (MIT)",
    removal: "Profilimi kaldır / düzelt",
    privacy: "KVKK aydınlatma metni",
    notAffiliated: "Trendyol ile bağlantılı değildir; Trendyol'un resmî aracı değildir.",
  },
  filters: {
    searchLabel: "Ara",
    searchPlaceholder: "İsim, hesap adı, marka ya da bio içinde ara…",
    segment: "Kategori",
    tier: "Takipçi basamağı",
    platform: "Platform",
    pool: "Trendyol koleksiyonu",
    minEr: "En az etkileşim",
    minQuality: "En az kitle kalitesi",
    sort: "Sırala",
    all: "Tümü",
    bothPlatforms: "İkisi de",
    any: "Fark etmez",
    erStep: (s: string) => `%${s} ve üstü`,
    qualityStep: (s: string) => `${s} ve üstü`,
    sorts: {
      followers: "Takipçi",
      er: "Etkileşim oranı",
      kalite: "Kitle kalitesi",
      brands: "Marka deneyimi",
      newest: "En yeni",
    },
  },
  directory: {
    metaTitle: "Rehber",
    metaDescription: "Trendyol influencer'larını kategori, takipçi basamağı, etkileşim ve çalıştıkları markalara göre ara ve sırala.",
    title: "Rehber",
    intro: (count: string) =>
      `${count} influencer. Marka adı yazarsan o markayla çalışanlar, kategori seçersen o kitleye konuşanlar listelenir.`,
    results: "sonuç",
    pageOf: (page: number, pages: number) => ` · sayfa ${page}/${pages}`,
    emptyBefore: "Bu filtrelerle eşleşen influencer yok. Bir filtreyi kaldırmayı dene ya da",
    emptyLink: "mağaza linkinle eşleşme raporu iste",
    pagesLabel: "Sayfalar",
    previous: "← Önceki",
    next: "Sonraki →",
  },
  row: {
    verified: "Doğrulanmış hesap",
    followers: "takipçi",
    engagement: "etkileşim",
    collection: "Koleksiyonlu",
    quality: (score: number) => `Kalite ${score}`,
  },
};

export type Metinler = typeof tr;
