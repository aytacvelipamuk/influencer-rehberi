# Başka bir pazaryerine uyarlama (Hepsiburada, n11, …)

Rehber Trendyol satıcıları için yazıldı, ama yöntemin çoğu pazaryerinden bağımsızdır:
etkileşim, takipçi basamağı, kitle kalitesi ve kategori sınıflandırıcı (`lib/scoring`, `scripts/topla`) hiçbir
pazaryerini bilmez. Trendyol'a bağlı olan üç şey var:

1. **`pool` alanı** — "Trendyol koleksiyonu var / yok".
2. **Mağaza linki** — eşleşme formu yalnız `trendyol.com` adresini kabul eder.
3. **Arayüz metinleri** — başlıklar, açıklamalar, filtre etiketi.

Bu belge her birinde neyin değişeceğini sırayla anlatır. Önce 1. bölümü okuyun: geri kalanı ondan çıkar.

---

## 1. `pool` alanı ne demek, sizin pazaryerinizde karşılığı ne?

Trendyol'da influencer'lar ürünleri kendi **koleksiyonlarına** ekler ve satıştan pay alır. Rehberde
`pool: "trendyol"`, hesabın böyle bir koleksiyonu olduğunu söyler. Satıcı için anlamı şudur: bu kişi ürününü
doğrudan kendi vitrinine ekleyebilir. Ayrıca koleksiyondaki markalar `brands` alanını, bu markalar da eşleşme
raporundaki "rakip markayla iş birliği" kanıtını besler.

Uyarlamadan önce sorun: **Pazaryerinizde influencer'ın ürün listeleyip satıştan pay aldığı bir program var mı?**

| Durum | Yapılacak |
|---|---|
| Var (affiliate / vitrin / koleksiyon) | `pool` aynı anlamla kalır; yalnız etiketler değişir (2. bölüm). `brands` alanını o programın vitrinlerinden doldurun. |
| Yok | `pool` her kayıtta `"bagimsiz"` olur. Filtreyi gizleyin; `brands` alanını iş birliği etiketlerinden (`analysis.partners`) ya da kendi listenizden doldurun. Eşleşme puanının koleksiyon bileşeni (+10) hiç çalışmaz, bu sorun değildir. |

Toplayıcıda `pool` şu satırda belirlenir: `scripts/topla/build.ts` → `pool: x.brands?.length ? "trendyol" : "bagimsiz"`.
`hesaplar.csv`'de marka verdiğiniz hesap "koleksiyonlu" sayılır.

### Genelleştirme önerisi (ayrı PR)

`"trendyol"` değeri hem veri hem etiket olarak kullanılıyor. Kalıcı çözüm, veriyi pazaryerinden ayırmaktır:

```ts
// lib/types.ts
export type Pool = "koleksiyon" | "bagimsiz";   // "trendyol" → "koleksiyon"

// lib/site.ts
marketplace: {
  name: process.env.NEXT_PUBLIC_MARKETPLACE_NAME || "Trendyol",
  collectionLabel: process.env.NEXT_PUBLIC_COLLECTION_LABEL || "Trendyol koleksiyonu",
  storeHost: process.env.NEXT_PUBLIC_STORE_HOST || "trendyol.com",
},
```

Geçiş için okuma tarafında eski değeri kabul edin (`pool === "trendyol" ? "koleksiyon" : pool`), böylece mevcut
`influencers.json` dosyaları bozulmaz. Bu değişiklik şu yerlere dokunur:

| Dosya | Ne değişir |
|---|---|
| `lib/types.ts` | `Pool` türü |
| `lib/query.ts` | `POOLS` listesi; URL'deki `havuz=` değeri |
| `lib/format.ts` | `POOL_NAMES` (`MARKETPLACE_NAMES` zaten birden çok pazaryerini tanır) |
| `lib/scoring/match.ts` | `isCollection` karşılaştırması ve gerekçe metni |
| `scripts/topla/build.ts` | `pool` ataması |
| `scripts/ornek-veri-uret.mjs` | örnek verideki `pool` değerleri |
| `app/page.tsx`, `app/i/[platform]/[handle]/page.tsx`, `components/InfluencerCard.tsx`, `components/FilterBar.tsx` | `r.pool === "trendyol"` karşılaştırmaları ve etiketler |

---

## 2. Arayüz metinleri

Trendyol adının geçtiği yerler (`grep -rni trendyol app components lib` ile güncel listeyi alın):

| Dosya | İçerik |
|---|---|
| `app/layout.tsx` | site başlığı ve açıklaması (arama motoru) |
| `app/page.tsx` | giriş metni, "nasıl kullanılır" kartları, sayaç, eşleşme çağrısı |
| `app/rehber/page.tsx` | sayfa açıklaması |
| `app/i/[platform]/[handle]/page.tsx` | "koleksiyonu var" rozeti, koleksiyon bağlantısı, marka sayısı notu, rapor çağrısı |
| `app/eslestir/page.tsx` | form etiketi, örnek link, "mağazanı okuruz" adımı |
| `app/rapor/[token]/page.tsx` | rakip markalar açıklaması, koleksiyon notu |
| `app/nasil-olcuyoruz/page.tsx` | "kimler var", kategori ve marka tanımları |
| `app/kvkk/page.tsx` | veri kaynağı cümlesi (hukukçunuza da gösterin) |
| `components/SiteChrome.tsx` | altbilgi tanımı ve "bağlantılı değildir" notu |
| `components/FilterBar.tsx` | "Trendyol koleksiyonu" filtresi |
| `components/InfluencerCard.tsx` | "Koleksiyonlu" etiketi |

Altbilgideki "… ile bağlantılı değildir; resmî aracı değildir" notunu kendi pazaryerinizin adıyla **koruyun**.
Pazaryerinin logosunu kullanmayın.

Metinleri tek dosyada toplama işi sürüyor (`lib/metinler/tr.ts`, bkz. issue #6). O iş bittiğinde bu tablonun büyük
kısmı tek dosyada değişecek.

---

## 3. Mağaza linki ve eşleşme raporu

`lib/requests.ts` → `parseStoreUrl()` linkten **satıcı kimliğini** çıkarır ve yalnız `trendyol.com` alan adını kabul eder:

- `trendyol.com/magaza/<ad>-m-<id>`
- `?merchantId=<id>` ya da `?mid=<id>`

Başka bir pazaryeri için:

1. Alan adı kontrolünü değiştirin (`/(^|\.)trendyol\.com$/` → kendi alan adınız).
2. Kimliği nereden okuyacağınızı belirleyin. Bazı pazaryerlerinde mağaza adresinde sayısal kimlik yoktur, yalnız
   mağaza adı (slug) vardır. O durumda `merchantId` olarak slug'ı döndürün: alan metin türündedir.
3. Hata mesajındaki örnek linki güncelleyin.
4. `lib/requests.test.ts`'e kendi link biçimleriniz için test ekleyin. Kimlik uzunluğunu sabitlemeyin: Trendyol'da
   satıcı kimliği 2 ile 10+ hane arasında değişir, başka pazaryerinde de değişebilir.

**Raporu üreten hat bu repoda yok.** Site formu yalnız talebi kaydeder (`talepler/eslestir.jsonl`). Mağazanın ürünlerini
ve kategorisini okuyup öneri listesini üreten iş sizin tarafınızdadır. Puanlama için `lib/scoring/match.ts`'teki
`scoreMatch()` hazırdır. Rapor JSON'unun biçimi: [VERI-SOZLESMESI.md](VERI-SOZLESMESI.md#rapor).

Bir pazaryerinin sayfalarını okumadan önce kullanım şartlarına bakın. Bu repo bilerek hiçbir pazaryerinden veri
okumaz.

---

## 4. Değişmeyenler

- **Kategoriler** (`scripts/topla/segments.ts`) pazaryerinden bağımsızdır. Pazaryerinizin kategori ağacına göre
  ad ve anahtar kelime ekleyebilirsiniz.
- **Takipçi basamakları ve etkileşim bantları** (`lib/scoring/engagement.ts`) Türkiye'deki Instagram hesaplarına
  göre seçildi. Başka ülkede kullanacaksanız `ENGAGEMENT_BANDS` değerlerini kendi ölçümünüzle kontrol edin.
- **Influencer ücreti** gösterilmez. Bu bir tasarım kararıdır; çatalınızda değiştirmek size kalmış.

## Kontrol listesi

- [ ] Koleksiyon/affiliate programı var mı? (1. bölüm tablosu)
- [ ] `pool` etiketleri ya da genelleştirme PR'ı
- [ ] Arayüz metinleri (2. bölüm tablosu); altbilgideki "bağlantılı değildir" notu korunuyor
- [ ] `parseStoreUrl()` + testleri
- [ ] KVKK/aydınlatma metni kendi hukukçunuzdan geçti
- [ ] `npm test` ve `npm run build` yeşil
