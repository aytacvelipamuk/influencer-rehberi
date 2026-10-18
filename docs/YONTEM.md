# Yöntem

Kod: `lib/scoring` (saf TypeScript, testleri `lib/scoring/scoring.test.ts`).

## Etkileşim oranı (E.R.)

Gönderi başına `(beğeni + yorum) / takipçi × 100`, son 12 gönderinin **medyanı**. Ortalama kullanılmaz: tek viral
gönderi oranı şişirmesin.

## Takipçi basamağı

HypeAuditor tanımı: nano 1–10 B · mikro 10–50 B · mid-tier 50–500 B · makro 500 B–1 M · mega 1 M+ · altı "aday".

## Beklenen etkileşim

Takipçi bandına göre: <5 B %5 · <20 B %3 · <100 B %2 · <500 B %1,2 · <1 M %0,9 · üstü %0,7.

## Kitle kalitesi (tahmin, 0–100)

Takipçi listesine erişmeden, herkese açık dolaylı sinyallerden kurulur. Bileşenler (en yüksek puan):

| Bileşen | Puan | Mantık |
|---|---|---|
| Etkileşim / beklenen | 30 | Beklenenin %60'ı altı orantılı düşer; 4 katı üstü "etkileşim grubu olabilir" (12 puan) |
| Yorum gerçekliği | 20 | Gerçek cümle payı (≥4 anlamlı kelime, kalıp övgü/emoji değil); tekrar >%30 ise −5. En az 10 yorum |
| Yorum / beğeni | 10 | %0,2–%10 olağan; altı "beğeni şişirilmiş olabilir", üstü "çekiliş/yorum grubu" |
| Takip / takipçi | 10 | ≤0,5 tam, ≥1,5 sıfır (takip-geri takip büyümesi) |
| Takipçi artışı | 10 | İki ölçüm arasında %20+ sıçrama işaretlenir (toplayıcıyı düzenli çalıştırın) |
| Beğeni dağılımı | 10 | Değişkenlik katsayısı <0,15 ise "satın alınmış beğeni izi olabilir" |
| Reels izlenme / takipçi | 10 | ≥%30 tam, <%5 düşük |

Verisi olmayan bileşen puana girmez; puan, kalan bileşenlerin en yüksek toplamına ölçeklenir. **Üçten az bileşen varsa
puan verilmez** ("Yetersiz veri"). Etiket: ≥75 Yüksek · ≥50 Orta · altı Düşük. Her bileşen profilde gerekçesiyle yazar.

Bu bir tahmindir; sahte takipçiyi doğrudan saymaz. Kesin sonuç için takipçi örneklemi gerekir (giriş duvarı arkasında).

## Eşleşme puanı (rapor)

Kanıt gücü (rakip markayla iş birliği 45 · konu paylaşımı 35 · kategori araması 25 · yakın marka 15 · segment 8) +
etkileşim (%6 ve üstü tam 25; %25 üstü ölçüm hatası sayılır, puana girmez; %0,5 altı −20) + mağaza ölçeğine uygun
basamak (küçük mağaza: mikro 20, nano/mid-tier 15) + Trendyol koleksiyonu (10). Ücret kullanılmaz.
Kod: `lib/scoring/match.ts` (`scoreMatch`, `storeSize`; 50 üründen az mağaza "küçük").
