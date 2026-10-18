import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Chip, InfluencerRow } from "@/components/InfluencerCard";
import { Collaborations, Highlights, QualityPanel, RecentPosts, Rhythm } from "@/components/ProfileAnalysis";
import { findInfluencer, loadSnapshot } from "@/lib/data";
import { formatCount, formatEr, formatWhole, MARKETPLACE_NAMES, PLATFORM_NAMES, shortSegment, TIER_NAMES } from "@/lib/format";
import type { Influencer } from "@/lib/types";

const SIMILAR = 5;

export async function generateMetadata({ params }: PageProps<"/i/[platform]/[handle]">): Promise<Metadata> {
  const { platform, handle } = await params;
  const r = await findInfluencer(platform, handle);
  if (!r) return { title: "Bulunamadı" };
  const name = r.display_name || r.handle;
  return {
    title: `${name} (@${r.handle})`,
    description: `${name}: ${formatCount(r.followers)} takipçi, etkileşim ${formatEr(r.er)}, ${r.brands.length} marka iş birliği.`,
  };
}

function similar(all: Influencer[], r: Influencer) {
  const segment = r.segments[0];
  if (!segment) return [];
  return all
    .filter((x) => x !== r && x.segments[0] === segment && x.tier === r.tier)
    .sort((a, b) => (b.er ?? -1) - (a.er ?? -1))
    .slice(0, SIMILAR);
}

export default async function InfluencerPage({ params }: PageProps<"/i/[platform]/[handle]">) {
  const { platform, handle } = await params;
  const r = await findInfluencer(platform, handle);
  if (!r) notFound();
  const { influencers, labels } = await loadSnapshot();
  const name = r.display_name || r.handle;
  const benzer = similar(influencers, r);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8 md:pt-14">
      <Link href="/rehber" className="underline-grow text-sm text-ink-2">← Rehber</Link>

      <header className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-end">
        <Avatar src={r.avatar} name={name} size={150} />
        <div>
          <h1 className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95]">
            {name}
            {r.verified && <span className="ml-3 align-middle text-2xl text-pink" title="Doğrulanmış hesap">✓</span>}
          </h1>
          <p className="mt-3 text-lg text-ink-2">@{r.handle} · {PLATFORM_NAMES[r.platform]}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {r.tier && <Chip strong>{TIER_NAMES[r.tier] ?? r.tier}</Chip>}
            {r.pool === "trendyol" && <Chip strong>Trendyol koleksiyonu var</Chip>}
            {r.segments.map((s) => <Chip key={s}>{shortSegment(labels.segments[s] ?? s)}</Chip>)}
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={r.profile_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-pink px-6 py-3 font-medium text-white transition-colors hover:bg-pink-dark">
          {PLATFORM_NAMES[r.platform]} profiline git ↗
        </a>
        {r.collection_url && (
          <a href={r.collection_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-ink/20 px-6 py-3 font-medium transition-colors hover:border-pink hover:text-pink">
            Trendyol koleksiyonu ↗
          </a>
        )}
      </div>

      <dl className="mt-12 grid grid-cols-2 border-y border-line md:grid-cols-4">
        <Stat label="Takipçi" value={r.followers === null ? "—" : formatWhole(r.followers)} />
        <Stat label="Etkileşim oranı" value={formatEr(r.er)} note={r.er_posts ? `son ${r.er_posts} gönderinin medyanı` : "henüz ölçülmedi"} />
        <Stat label="Çalıştığı marka" value={String(r.brands.length)} note={r.brands.length ? "Trendyol koleksiyonundan" : undefined} />
        <Stat label="Pazaryeri izi" value={r.marketplaces.length ? r.marketplaces.map((m) => MARKETPLACE_NAMES[m] ?? m).join(", ") : "—"} />
      </dl>

      {r.analysis ? (
        <div className="mt-16 space-y-20">
          <Highlights items={r.analysis.highlights ?? []} />
          <RecentPosts posts={r.analysis.recent} />
          <QualityPanel quality={r.analysis.quality} />
          <Rhythm a={r.analysis} />
          <Collaborations a={r.analysis} />
        </div>
      ) : (
        <p className="mt-12 rounded-xl bg-blush p-6 text-ink-2">
          Bu hesabın paylaşımları henüz incelenmedi. Son paylaşımlar, kitle kalitesi ve paylaşım ritmi incelendikten sonra burada görünür.
        </p>
      )}

      <div className="mt-20 grid gap-12 md:grid-cols-[1fr_1.3fr]">
        <section>
          <h2 className="font-serif text-3xl">Bio</h2>
          <p className="mt-4 whitespace-pre-line text-ink-2">{r.bio || "Bio henüz okunmadı."}</p>
        </section>
        <section>
          <h2 className="font-serif text-3xl">Çalıştığı markalar</h2>
          {r.brands.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {r.brands.map((b) => (
                <li key={b}>
                  <Link href={`/rehber?marka=${encodeURIComponent(b)}`} className="inline-block rounded-full border border-line px-4 py-1.5 transition-colors hover:border-pink hover:text-pink" title={`${b} ile çalışan diğer influencer'lar`}>
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-2">Koleksiyonunda marka bilgisi yok.</p>
          )}
        </section>
      </div>

      <section className="mt-16 rounded-xl bg-blush p-8 md:p-12">
        <h2 className="max-w-2xl font-serif text-[clamp(1.9rem,3.5vw,2.75rem)] leading-[1.05]">Mağazana uygun isimleri biz çıkaralım.</h2>
        <p className="mt-3 max-w-2xl text-ink-2">Trendyol mağaza linkini ver; kategorine, rakiplerinin çalıştığı isimlere ve etkileşime göre eşleşme raporunu e-postana gönderelim.</p>
        <Link href="/eslestir" className="mt-6 inline-flex h-12 items-center rounded-full bg-pink px-7 font-medium text-white transition-colors hover:bg-pink-dark">Eşleşme raporu iste</Link>
      </section>

      {benzer.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">Aynı kategoride, aynı büyüklükte</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {benzer.map((x) => (
              <li key={`${x.platform}:${x.handle}`}>
                <InfluencerRow r={x} segments={labels.segments} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-line py-6 pr-4 [&:not(:first-child)]:md:border-l [&:not(:first-child)]:md:pl-6">
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="mt-1 font-serif text-4xl tabular-nums">{value}</dd>
      {note && <p className="mt-1 text-xs text-faint">{note}</p>}
    </div>
  );
}
