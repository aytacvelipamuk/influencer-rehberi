import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "@/components/RequestForm";
import { LoopVideo } from "@/components/Video";

export const metadata: Metadata = {
  title: "Mağazana uygun influencer'lar",
  description: "Trendyol mağaza linkini ver; kategorine ve rakiplerinin çalıştığı isimlere göre ücretsiz influencer eşleşme raporunu e-postana gönderelim.",
};

const STEPS = [
  ["Mağazanı okuruz", "Ürünlerini, kategorini ve fiyat seviyeni Trendyol'daki mağaza sayfandan alırız."],
  ["Rakiplerini buluruz", "Aynı kategoride satan markaları ve onlarla çalışmış influencer'ları çıkarırız."],
  ["Sıralarız", "Kanıtın gücü, etkileşim ve mağazanın ölçeğine uygun takipçi büyüklüğüne göre puanlarız."],
  ["Gerekçesiyle göndeririz", "İlk 20 öneri, her birinin neden önerildiği ve dikkat edilecekler e-postana gelir."],
];

export default function MatchPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-14 md:grid-cols-[1.1fr_1fr] md:px-8 md:pt-20">
      <div>
        <h1 className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.98]">Mağazana uygun influencer&apos;ları bulalım</h1>
        <p className="mt-5 max-w-xl text-lg text-ink-2">Ücretsiz. Rapor hazır olunca e-postana gelir, çoğunlukla aynı gün.</p>
        <ol className="mt-10 divide-y divide-line border-y border-line">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-5">
              <span className="font-serif text-3xl leading-none text-pink">{i + 1}</span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="block text-ink-2">{body}</span>
              </span>
            </li>
          ))}
        </ol>
        <figure className="mt-10 overflow-hidden rounded-xl border border-line">
          <LoopVideo src="/video/ornek-rapor.mp4" poster="/video/ornek-rapor.jpg" label="Örnek eşleşme raporu" className="block w-full" />
          <figcaption className="bg-blush px-5 py-3 text-sm text-ink-2">Örnek rapor: bir intim bakım markası için öneriler.</figcaption>
        </figure>
      </div>
      <div className="md:sticky md:top-24 md:self-start">
        <div className="rounded-xl border border-line bg-paper p-6 shadow-[0_30px_60px_-30px_rgb(42_21_32/0.3)] md:p-8">
          <RequestForm
            endpoint="/api/eslestir"
            submitLabel="Eşleşme raporumu hazırla"
            fields={[
              { name: "store", label: "Trendyol mağaza linkin", type: "url", placeholder: "https://www.trendyol.com/magaza/…-m-123456", required: true },
              { name: "email", label: "E-posta adresin", type: "email", placeholder: "ad@firma.com", required: true },
              { name: "note", label: "Not (isteğe bağlı)", type: "textarea", placeholder: "Hangi ürün için, nasıl bir iş birliği düşünüyorsun?" },
            ]}
            consents={[
              { name: "kvkk", label: <>Raporun gönderilmesi için verilerimin işlenmesine dair <Link href="/kvkk" className="text-pink underline">aydınlatma metnini</Link> okudum.</>, required: true },
              { name: "marketing", label: "Pazaryeri büyümesiyle ilgili e-posta almak istiyorum (isteğe bağlı)." },
            ]}
            success={{ title: "Talebin alındı", body: "Mağazanı okuyup eşleşme raporunu hazırlıyoruz. Hazır olunca e-postana gelecek." }}
          />
        </div>
      </div>
    </div>
  );
}
