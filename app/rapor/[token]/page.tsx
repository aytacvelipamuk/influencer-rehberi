import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { loadReport, loadSnapshot } from "@/lib/data";
import { formatCount, formatEr, formatWhole, PLATFORM_NAMES, TIER_NAMES } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Influencer, Recommendation } from "@/lib/types";

export const metadata: Metadata = { title: "Eşleşme raporu", robots: { index: false, follow: false } };

const EVIDENCE_NAMES: Record<string, string> = {
  marka: "Rakip markayla çalışmış",
  konu: "Bu konuda paylaşım yapmış",
  arama: "Kategori aramasında çıkıyor",
  marka_zayif: "Yakın markayla çalışmış",
  segment: "Kitlesi uygun",
};

export default async function ReportPage({ params }: PageProps<"/rapor/[token]">) {
  const { token } = await params;
  const report = await loadReport(token);
  if (!report) notFound();
  const { influencers } = await loadSnapshot();
  const byKey = new Map(influencers.map((r) => [`${r.platform}:${r.handle}`, r]));
  const { store } = report;
  const date = new Date(report.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const strong = report.recommendations.filter((r) => r.evidence === "marka" || r.evidence === "konu").length;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 md:px-8 md:pt-16">
      <p className="text-sm text-ink-2">Eşleşme raporu · {date}</p>
      <h1 className="mt-3 font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.95]">{store.store_name ?? "Mağazan"} için influencer önerileri</h1>
      <p className="mt-6 max-w-3xl text-lg text-ink-2">
        Mağazanın {store.product_count} ürününü okuduk ({store.categories.map((c) => c.name).join(", ")}). Bu kategoriyi
        &quot;{report.scope.title}&quot; kapsamında inceledik ve {formatWhole(report.candidates)} hesabı puanladık. İlk{" "}
        {report.recommendations.length} öneriden {strong} tanesi rakip markayla çalışmış ya da bu konuda paylaşım yapmış hesap.
      </p>

      <section className="mt-14">
        <h2 className="font-serif text-4xl">Öneriler</h2>
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {report.recommendations.map((rec, i) => (
            <RecommendationRow key={`${rec.platform}:${rec.handle}`} rank={i + 1} rec={rec} profile={byKey.get(`${rec.platform}:${rec.handle}`)} />
          ))}
        </ol>
      </section>

      {report.competitors.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-4xl">Kategorideki markalar</h2>
          <p className="mt-3 max-w-2xl text-ink-2">Aynı kategoride satılan markalar ve Trendyol koleksiyonunda onlarla çalışmış influencer sayısı.</p>
          <table className="mt-6 w-full text-left">
            <thead className="border-b border-line text-sm text-ink-2">
              <tr><th className="py-3 font-normal">Marka</th><th className="py-3 text-right font-normal">Ürün</th><th className="py-3 text-right font-normal">Çalışan influencer</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.competitors.map((c) => (
                <tr key={c.brand}>
                  <td className="py-3">
                    <Link href={`/rehber?marka=${encodeURIComponent(c.brand)}`} className="underline-grow">{c.brand}</Link>
                  </td>
                  <td className="py-3 text-right tabular-nums">{c.products}</td>
                  <td className="py-3 text-right tabular-nums">{c.influencers || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-16 grid gap-10 rounded-xl bg-blush p-8 md:grid-cols-2 md:p-10">
        <div>
          <h2 className="font-serif text-3xl">Puan nasıl hesaplandı</h2>
          <ul className="mt-4 space-y-2 text-ink-2">
            <li>Kanıtın gücü: rakip markayla çalışmak en güçlü, yalnız kitle uyumu en zayıf kanıttır.</li>
            <li>Etkileşim: son gönderilerin medyanı; %6 ve üstü tam puan, akla yatkın olmayan oranlar puana girmez.</li>
            <li>Büyüklük: mağazanın ölçeğine uyan takipçi basamağı öne çıkar.</li>
            <li>Trendyol koleksiyonu olan hesap ürünü doğrudan kendi vitrinine ekleyebilir.</li>
          </ul>
        </div>
        {SITE.ctaUrl && (
          <div>
            <h2 className="font-serif text-3xl">Sonraki adım</h2>
            <p className="mt-4 text-ink-2">
              Listedeki isimlerle nasıl iletişime geçileceği, hangi ürünün kime gönderileceği ve sonucun nasıl ölçüleceği
              mağazadan mağazaya değişir. İstersen bunu birlikte planlayabiliriz.
            </p>
            <a href={SITE.ctaUrl} className="mt-6 inline-flex h-12 items-center rounded-full bg-pink px-7 font-medium text-white transition-colors hover:bg-pink-dark">
              Görüşme planla
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

interface RowProps {
  rank: number;
  rec: Recommendation;
  profile?: Influencer;
}

function RecommendationRow({ rank, rec, profile }: RowProps) {
  const name = profile?.display_name || rec.handle;
  const href = profile ? `/i/${rec.platform}/${rec.handle}` : `https://www.instagram.com/${rec.handle}/`;
  return (
    <li className="grid grid-cols-[2rem_auto_1fr] gap-x-4 gap-y-2 py-6 md:grid-cols-[2.5rem_auto_1fr_auto] md:gap-x-6">
      <span className="font-serif text-3xl leading-none text-pink">{rank}</span>
      <Avatar src={profile?.avatar ?? null} name={name} size={64} />
      <div className="min-w-0">
        <a href={href} className="text-xl font-medium hover:text-pink">{name}</a>
        <p className="text-sm text-faint">
          @{rec.handle} · {PLATFORM_NAMES[rec.platform]}
          {rec.tier && ` · ${TIER_NAMES[rec.tier]?.split(" ")[0] ?? rec.tier}`}
        </p>
        <p className="mt-2 text-sm font-medium text-pink-dark">{EVIDENCE_NAMES[rec.evidence] ?? rec.evidence}</p>
        <ul className="mt-1 space-y-0.5 text-[0.95rem] text-ink-2">
          {rec.reasons.map((r) => <li key={r}>{r}</li>)}
          {rec.warnings.map((w) => <li key={w} className="text-faint">Dikkat: {w}</li>)}
        </ul>
      </div>
      <dl className="col-span-3 flex gap-6 text-sm md:col-span-1 md:block md:space-y-1 md:text-right">
        <div><dt className="inline text-faint md:block">Takipçi </dt><dd className="inline tabular-nums md:block md:text-lg">{formatCount(rec.followers)}</dd></div>
        <div><dt className="inline text-faint md:block">Etkileşim </dt><dd className="inline tabular-nums md:block md:text-lg">{formatEr(rec.er)}</dd></div>
      </dl>
    </li>
  );
}
