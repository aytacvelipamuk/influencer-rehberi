import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { HeroScroll } from "@/components/HeroScroll";
import { Reveal } from "@/components/Reveal";
import { LoopVideo } from "@/components/Video";
import { loadSnapshot } from "@/lib/data";
import { formatWhole, shortSegment } from "@/lib/format";
import { brandCount, faceWall, segmentCounts } from "@/lib/stats";

const FACES = 48;
const CATEGORY_LINKS = 12;

const USES = [
  {
    title: "Rakibin kiminle çalışıyor, gör",
    body: "Bir markayı yaz; o markanın ürününü Trendyol koleksiyonunda öne çıkaran herkes listelensin. Rakibin işe yarar bulduğu isim, senin için de denenmiş bir isimdir.",
  },
  {
    title: "Takipçi değil, tepki say",
    body: "Etkileşim oranı son gönderilerin medyanından hesaplanır. 500 bin takipçili ama yorum almayan hesabı, 30 bin takipçili ve kitlesi konuşan hesaptan ayırırsın.",
  },
  {
    title: "Koleksiyonu olanı bul",
    body: "Trendyol koleksiyonu olan influencer, ürününü doğrudan kendi vitrinine ekleyebilir. Filtrede tek tıkla yalnız onları görürsün.",
  },
];

const STEPS = [
  {
    title: "Kategorini seç, aradığın büyüklüğü belirle",
    body: "Güzellik, ev, anne-bebek… Kategori ve takipçi basamağıyla listeyi daralt; etkileşime göre sırala.",
    video: "/video/adim-1.mp4",
  },
  {
    title: "Profili aç, kanıta bak",
    body: "Koleksiyonu, çalıştığı markalar, bio'su ve etkileşimi aynı sayfada. Instagram'ına ve Trendyol koleksiyonuna tek tıkla geç.",
    video: "/video/adim-2.mp4",
  },
  {
    title: "Mağaza linkini ver, raporu bekle",
    body: "Mağazanı okuyup kategorine, rakiplerinin çalıştığı isimlere ve etkileşime göre ilk 20 öneriyi gerekçeleriyle e-postana gönderiyoruz.",
    video: "/video/adim-3.mp4",
  },
];

export default async function Home() {
  const { influencers, labels, generated_at } = await loadSnapshot();
  const withCollection = influencers.filter((r) => r.pool === "trendyol").length;
  const faces = faceWall(influencers, FACES);
  const categories = segmentCounts(influencers).slice(0, CATEGORY_LINKS);
  const updated = generated_at ? new Date(generated_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : "";

  return (
    <>
      {/* Hero: tam ekran video, kaydırdıkça pembe zeminde karta küçülür (sticky video → karta küçülme). */}
      <HeroScroll>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="font-serif text-[clamp(2.75rem,7.4vw,6.75rem)] leading-[0.96] tracking-[-0.01em]">
            <span className="block">Ürününü kim anlatsın?</span>
            <span className="block md:text-right">Influencer&apos;ları karşılaştır.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85 md:text-xl">
            Trendyol&apos;daki {formatWhole(influencers.length)}{" "}influencer&apos;ın koleksiyonu, çalıştığı markalar ve kitlesinin
            tepkisi tek yerde. Satıcılara ücretsiz.
          </p>
          <form action="/rehber" className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row" role="search">
            <label className="flex-1">
              <span className="sr-only">Influencer, marka ya da kategori ara</span>
              <input
                name="q"
                type="search"
                placeholder="Marka, isim ya da kategori yaz: marka adı, anne, cilt bakımı…"
                className="h-14 w-full rounded-full border-0 bg-white px-6 text-base text-ink placeholder:text-faint"
              />
            </label>
            <button className="h-14 rounded-full bg-pink px-8 font-medium text-white transition-colors hover:bg-pink-dark">Ara</button>
          </form>
          <Link href="/eslestir" className="underline-grow mt-5 inline-block text-white">
            Ya da mağaza linkini ver, sana uygun olanları biz seçelim →
          </Link>
        </div>
      </HeroScroll>

      <div className="border-b border-line">
        <dl className="mx-auto flex max-w-7xl flex-wrap gap-x-10 gap-y-2 px-4 py-5 text-sm text-ink-2 md:px-8">
          <div><dt className="inline">Influencer </dt><dd className="inline font-medium text-ink">{formatWhole(influencers.length)}</dd></div>
          <div><dt className="inline">Trendyol koleksiyonu olan </dt><dd className="inline font-medium text-ink">{formatWhole(withCollection)}</dd></div>
          <div><dt className="inline">İş birliği yapılan marka </dt><dd className="inline font-medium text-ink">{formatWhole(brandCount(influencers))}</dd></div>
          {updated && <div><dt className="inline">Güncelleme </dt><dd className="inline font-medium text-ink">{updated}</dd></div>}
        </dl>
      </div>

      {/* Ne işe yarar: bölünmüş düzen, sağda ürünün kendi ekran kaydı */}
      <section id="ne-ise-yarar" className="mx-auto grid max-w-7xl gap-12 px-4 pt-24 md:grid-cols-[1fr_1.15fr] md:items-center md:px-8">
        <div>
          <Reveal>
            <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02]">
              Kimin, kiminle çalıştığını görmeden bütçe ayırma.
            </h2>
          </Reveal>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {USES.map((u) => (
              <li key={u.title} className="py-6">
                <h3 className="text-xl font-semibold">{u.title}</h3>
                <p className="mt-2 text-ink-2">{u.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <Reveal>
          <figure className="overflow-hidden rounded-xl border border-line bg-blush shadow-[0_30px_60px_-30px_rgb(42_21_32/0.35)]">
            <LoopVideo src="/video/demo-rehber.mp4" poster="/video/demo-rehber.jpg" label="Rehberde marka arama ve filtreleme" className="block w-full" />
            <figcaption className="px-5 py-3 text-sm text-faint">Rehberde marka araması: markayla çalışan influencer&apos;lar ve etkileşimleri.</figcaption>
          </figure>
        </Reveal>
      </section>

      {/* Yüz duvarı: gerçek hesaplar, en çok markayla çalışanlar (fotoğraf yoksa bölüm çıkmaz) */}
      {faces.length > 0 && (
      <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-2xl font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">En çok markayla çalışanlar</h2>
            <Link href="/rehber?sirala=brands" className="underline-grow text-pink">Tümünü sırala →</Link>
          </div>
        </Reveal>
        <ul className="mt-10 grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12">
          {faces.map((r) => (
            <li key={`${r.platform}:${r.handle}`}>
              <Link href={`/i/${r.platform}/${r.handle}`} className="group block" title={`${r.display_name || r.handle} · ${r.brands.length} marka`}>
                <span className="zoom-frame block aspect-square rounded-full ring-2 ring-transparent transition-shadow group-hover:ring-pink">
                  <Avatar src={r.avatar} name={r.display_name || r.handle} size={160} fill />
                </span>
                <span className="mt-1.5 block truncate text-center text-xs text-ink-2">{r.display_name || r.handle}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* Nasıl kullanılır: gerçek sıra, her adımın kendi ekran kaydı; düzen sağ-sol değişir */}
      <section id="nasil" className="mt-28 scroll-mt-16 bg-blush py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Reveal>
            <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02]">Nasıl kullanılır</h2>
          </Reveal>
          <ol className="mt-14 space-y-20">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid gap-8 md:grid-cols-2 md:items-center">
                <div className={i % 2 ? "md:order-2" : ""}>
                  <p className="font-serif text-6xl text-pink">{i + 1}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-3 max-w-md text-ink-2">{s.body}</p>
                </div>
                <Reveal>
                  <LoopVideo src={s.video} poster={s.video.replace(".mp4", ".jpg")} label={s.title} className="w-full rounded-xl border border-line bg-paper shadow-[0_24px_50px_-28px_rgb(42_21_32/0.4)]" />
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Kategori dizini: dergi içindekiler sayfası gibi */}
      <section className="mx-auto max-w-7xl px-4 pt-28 md:px-8">
        <Reveal>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.05]">Kategoriye göre</h2>
        </Reveal>
        <ul className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([key, n]) => (
            <li key={key} className="border-b border-line">
              <Link href={`/rehber?kategori=${key}`} className="group flex items-baseline justify-between gap-4 py-5 pr-6">
                <span className="text-xl transition-colors group-hover:text-pink">{shortSegment(labels.segments[key] ?? key)}</span>
                <span className="text-sm text-faint tabular-nums">{formatWhole(n)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Eşleştirme çağrısı: örnek raporun gerçek ekranı */}
      <section className="mx-auto mt-28 grid max-w-7xl gap-10 px-4 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8">
        <Reveal>
          <figure className="overflow-hidden rounded-xl border border-line shadow-[0_30px_60px_-30px_rgb(42_21_32/0.35)]">
            <LoopVideo src="/video/ornek-rapor.mp4" poster="/video/ornek-rapor.jpg" label="Örnek eşleşme raporu" className="block w-full" />
          </figure>
        </Reveal>
        <div>
          <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.02]">Listeyi biz çıkaralım.</h2>
          <p className="mt-5 text-lg text-ink-2">
            Trendyol mağaza linkini ver. Ürünlerini ve kategorini okuyoruz, aynı kategoride rakiplerinin çalıştığı influencer&apos;ları
            buluyoruz, etkileşime ve mağazanın ölçeğine göre sıralıyoruz. Rapor, her önerinin gerekçesiyle e-postana gelir.
          </p>
          <Link href="/eslestir" className="mt-8 inline-flex h-14 items-center rounded-full bg-pink px-8 font-medium text-white transition-colors hover:bg-pink-dark">
            Eşleşme raporu iste
          </Link>
        </div>
      </section>
    </>
  );
}
