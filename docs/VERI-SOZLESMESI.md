# Veri sözleşmesi

Site yalnız iki tür dosya okur. Kendi veri hattınızı kuruyorsanız bu biçimde yazmanız yeterli; tipler `lib/types.ts`'tedir.

## `data/influencers.json`

```jsonc
{
  "generated_at": "2026-10-18T12:00:00Z",
  "count": 2,                         // influencers.length ile aynı olmalı (yayın ucu denetler)
  "labels": {
    "segments": { "moda": "Moda & aksesuar", "guzellik_bakim": "Güzellik & bakım" },
    "tiers": [{ "key": "nano", "from": 1000, "to": 10000 }]
  },
  "influencers": [ /* Influencer */ ]
}
```

### Influencer

| Alan | Tip | Not |
|---|---|---|
| `handle` | string | küçük harf, `@`'siz |
| `platform` | `"instagram" \| "tiktok"` | |
| `pool` | `"trendyol" \| "bagimsiz"` | Trendyol koleksiyonu var mı |
| `display_name`, `bio`, `business_category` | string \| null | bio'da e-posta/telefon yayınlamayın |
| `followers` | number \| null | |
| `tier` | `aday\|nano\|mikro\|orta\|makro\|mega` \| null | `lib/scoring` `tier()` |
| `er`, `er_posts` | number \| null, number | etkileşim % (medyan) ve kaç gönderiden |
| `segments` | string[] | `labels.segments` anahtarları, en çok 3 |
| `brands` | string[] | çalıştığı markalar (koleksiyon ya da kendi kaynağınız) |
| `marketplaces` | string[] | `trendyol`, `hepsiburada`, … |
| `verified` | boolean | |
| `avatar` | string \| null | `avatars/instagram/<hesap>.jpg` (veri klasörüne göre) |
| `collection_url`, `profile_url` | string | |
| `first_seen_at` | ISO tarih | |
| `analysis` | Analysis \| null | gönderisi ölçülmemişse null |

### Analysis

`quality` (`score`, `label`, `components[]`), `recent[]` (son 6 paylaşım: `url, kind, thumb, likes, comments, views,
posted_at, paid, caption`), `rhythm` (`per_week`, `last_post_at`), `mix` (tür → sayı), `reels_avg_views`, `paid_share`,
`partners[]` (`account`, `posts`), `posts_measured`, `followers_history[]` (`at`, `followers`), `expected_er`,
`highlights[]` (`title`, `cover`, `url`). Görsel yolları veri klasörüne göredir: `posts/<id>.jpg`, `highlights/<id>.jpg`.

## Rapor

`data/raporlar/<jeton>.json` — jeton 32 karakter küçük hex. Alanlar `lib/types.ts` → `MatchReport`:
`store` (mağaza özeti), `scope`, `competitors[]`, `candidates`, `recommendations[]`
(`handle, platform, score, evidence, reasons[], warnings[], brands[], followers, tier, er`).
`evidence`: `marka` (rakip markayla çalışmış) · `konu` (konu paylaşımı) · `arama` · `marka_zayif` · `segment`.
Örnek: `ornek-veri/raporlar/0123456789abcdef0123456789abcdef.json`.
