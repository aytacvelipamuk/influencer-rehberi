import type { Metadata } from"next";
import { Reveal } from"@/components/Reveal";
import { TIER_NAMES } from"@/lib/format";

export const metadata: Metadata = { title:"Nasıl ölçüyoruz" };

const ITEMS = [
  ["Kimler var?","Trendyol'da koleksiyonu olan influencer'lar ve bio'sunda ya da gönderisinde Trendyol linki paylaşan, arama sonuçlarında Trendyol ürünü tanıtan hesaplar. Marka, mağaza ve pazaryeri hesapları rehbere alınmaz."],
  ["Takipçi basamağı", `HypeAuditor'un resmî tanımıyla: ${Object.values(TIER_NAMES).join(" ·")}.`],
  ["Etkileşim oranı","Son gönderilerdeki (beğeni + yorum) / takipçi oranının medyanı. Ortalama değil medyan: tek bir viral gönderi oranı şişirmesin diye. Kaç gönderiden hesaplandığı profilde yazar."],
  ["Kategori","Koleksiyondaki markaların Trendyol'da satıldığı kategori, bio ve gönderi metinleri ve hashtag'lerden çıkarılır. Bir hesap en çok üç kategoriye girer."],
  ["Çalıştığı markalar","Trendyol koleksiyonunda ürününü öne çıkardığı markalar, en sık görülenden başlayarak."],
  ["Kitle kalitesi (tahmin)", "Takipçi listesine erişim olmadığı için sahte takipçiyi doğrudan sayamayız; yedi dolaylı sinyalden 100 üzerinden puan veririz: etkileşimin bu büyüklükteki hesaplardan beklenene oranı, yorumların gerçek cümle payı, yorum/beğeni oranı, takip edilen/takipçi oranı, takipçi sıçramaları, gönderiler arası beğeni dağılımı ve Reels izlenme oranı. Verisi olmayan sinyal puana girmez; üçten az sinyal varsa puan vermeyiz. Her bileşen profilde gerekçesiyle yazar."],
  ["Son paylaşımlar", "En yeni gönderiler ve Reels, beğeni, yorum ve izlenmeleriyle. Instagram hikâyeleri gösterilmez: 24 saatte silinir ve giriş yapmadan okunamaz."],
  ["Ücret","Gösterilmez. Influencer ücretleri herkese açık değil ve tahmin yanıltıcı olur."],
  ["Güncellik","Profiller düzenli tazelenir; son güncelleme tarihi sayfanın altında yazar."],
];

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 md:pt-24">
      <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none">Nasıl ölçüyoruz</h1>
      <p className="mt-4 text-lg text-ink-2">Her sayının nereden geldiğini açıkça yazıyoruz. Tahmin olan yer varsa tahmin diyoruz.</p>
      <dl className="mt-12 space-y-4">
        {ITEMS.map(([t, d], i) => (
          <Reveal key={t} delay={0.04 * i}>
            <div id={t.startsWith("Kitle kalitesi") ? "kitle-kalitesi" : undefined} className="scroll-mt-24 border-b border-line py-6">
              <dt className="text-xl font-medium">{t}</dt>
              <dd className="mt-2 text-ink-2">{d}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </div>
  );
}
