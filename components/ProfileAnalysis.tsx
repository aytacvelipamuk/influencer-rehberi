import Link from "next/link";
import { formatCount } from "@/lib/format";
import type { Analysis, RecentPost } from "@/lib/types";

const KIND_NAMES: Record<string, string> = { Reel: "Reels", Carousel: "Kaydırmalı", Image: "Fotoğraf", Video: "Video" };
const dateTr = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : "—";

export function QualityPanel({ quality }: { quality: Analysis["quality"] }) {
  return (
    <section className="grid gap-10 md:grid-cols-[16rem_1fr]">
      <div>
        <h2 className="font-serif text-3xl">Kitle kalitesi</h2>
        <p className="mt-1 text-sm text-faint">Tahmin · dolaylı sinyallerden</p>
        <p className="mt-6 font-serif text-7xl leading-none tabular-nums">{quality.score ?? "—"}</p>
        <p className="mt-2 text-lg text-pink-dark">{quality.label}</p>
        <Link href="/nasil-olcuyoruz#kitle-kalitesi" className="underline-grow mt-4 inline-block text-sm text-ink-2">Nasıl hesaplanıyor?</Link>
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {quality.components.map((c) => (
          <li key={c.key} className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr_3.5rem] sm:items-center">
            <span className="font-medium">{c.label}</span>
            <span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-blush-2" aria-hidden>
                <span className="block h-full rounded-full bg-pink" style={{ width: `${(c.points / c.max) * 100}%` }} />
              </span>
              <span className="mt-1.5 block text-sm text-ink-2">{c.note}</span>
            </span>
            <span className="text-right text-sm text-faint tabular-nums">{c.points}/{c.max}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecentPosts({ posts }: { posts: RecentPost[] }) {
  return (
    <section>
      <h2 className="font-serif text-3xl">Son paylaşımlar</h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <li key={p.url}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
              {/* Görsel yoksa büyük boş kutu değil, metin kartı (18 Eki: boş pembe kutular bozuk görünüyordu). */}
              <span className={`zoom-frame relative block rounded-lg bg-blush-2 ${p.thumb ? "aspect-[4/5]" : "min-h-32 pt-12"}`}>
                {p.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element -- kendi rotamızdan, 640 px kaynak
                  <img src={`/${p.thumb}`} alt={p.caption ?? "Instagram paylaşımı"} loading="lazy" className="size-full object-cover" />
                ) : (
                  <span className="line-clamp-4 block px-4 pb-4 text-sm text-ink-2">{p.caption ?? "Paylaşım"}</span>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-medium">{KIND_NAMES[p.kind ?? ""] ?? p.kind}</span>
                {p.paid && <span className="absolute top-3 right-3 rounded-full bg-pink px-2.5 py-1 text-xs font-medium text-white">İş birliği</span>}
              </span>
              <span className="mt-2 flex flex-wrap gap-x-3 text-sm text-ink-2 tabular-nums">
                {p.views !== null && <span>{formatCount(p.views)} izlenme</span>}
                {p.likes !== null && <span>{formatCount(p.likes)} beğeni</span>}
                {p.comments !== null && <span>{formatCount(p.comments)} yorum</span>}
              </span>
              <span className="block text-xs text-faint">{dateTr(p.posted_at)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Öne çıkan hikâyeler: kapak + başlık, tıklayınca Instagram'da açılır. Hikâye içeriği toplanmaz. */
export function Highlights({ items }: { items: Analysis["highlights"] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="font-serif text-3xl">Öne çıkan hikâyeler</h2>
      <p className="mt-2 text-sm text-faint">Profilde sabitlenen hikâye grupları. 24 saatlik güncel hikâyeler Instagram&apos;a giriş yapmadan okunamaz.</p>
      <ul className="mt-6 flex gap-5 overflow-x-auto pb-2">
        {items.map((h, i) => (
          <li key={h.url ?? i} className="w-20 shrink-0 text-center">
            <a href={h.url ?? undefined} target="_blank" rel="noopener noreferrer" className="group block">
              <span className="zoom-frame mx-auto block size-20 rounded-full bg-blush-2 ring-2 ring-pink-soft ring-offset-2 transition-shadow group-hover:ring-pink">
                {h.cover && (
                  // eslint-disable-next-line @next/next/no-img-element -- kendi rotamızdan, 150 px kapak
                  <img src={`/${h.cover}`} alt="" loading="lazy" className="size-full rounded-full object-cover" />
                )}
              </span>
              <span className="mt-2 block truncate text-xs text-ink-2">{h.title || "Hikâye"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Sparkline({ points }: { points: Analysis["followers_history"] }) {
  const W = 320, H = 72, PAD = 6;
  const values = points.map((p) => p.followers);
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const xy = points.map((p, i) => [PAD + (i / (points.length - 1)) * (W - 2 * PAD), H - PAD - ((p.followers - min) / span) * (H - 2 * PAD)]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-20 w-full max-w-sm" role="img" aria-label={`Takipçi ${formatCount(values[0])} → ${formatCount(values.at(-1) ?? null)}`}>
      <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--color-pink)" strokeWidth="2" strokeLinejoin="round" />
      {xy.map(([x, y], i) => <circle key={points[i].at} cx={x} cy={y} r="2.5" fill="var(--color-pink)" />)}
    </svg>
  );
}

export function Rhythm({ a }: { a: Analysis }) {
  const total = Object.values(a.mix).reduce((s, n) => s + n, 0);
  const history = a.followers_history;
  return (
    <section className="grid gap-12 md:grid-cols-3">
      <div>
        <h2 className="font-serif text-3xl">Paylaşım ritmi</h2>
        <p className="mt-4 font-serif text-5xl tabular-nums">{a.rhythm.per_week === null ? "—" : a.rhythm.per_week.toLocaleString("tr-TR")}</p>
        <p className="text-ink-2">paylaşım / hafta</p>
        <p className="mt-3 text-sm text-faint">Son paylaşım: {dateTr(a.rhythm.last_post_at)} · {a.posts_measured} paylaşım incelendi</p>
      </div>
      <div>
        <h2 className="font-serif text-3xl">İçerik türü</h2>
        <ul className="mt-5 space-y-3">
          {Object.entries(a.mix).sort((x, y) => y[1] - x[1]).map(([k, n]) => (
            <li key={k}>
              <span className="flex justify-between text-sm"><span>{KIND_NAMES[k] ?? k}</span><span className="text-faint tabular-nums">%{Math.round((n / total) * 100)}</span></span>
              <span className="mt-1 block h-1.5 rounded-full bg-blush-2"><span className="block h-full rounded-full bg-pink" style={{ width: `${(n / total) * 100}%` }} /></span>
            </li>
          ))}
        </ul>
        {a.reels_avg_views !== null && <p className="mt-4 text-sm text-ink-2">{a.mix.Reel ? "Reels" : "Video"} başına ortalama {formatCount(a.reels_avg_views)} izlenme</p>}
      </div>
      <div>
        <h2 className="font-serif text-3xl">Takipçi seyri</h2>
        {history.length >= 2 ? (
          <>
            <Sparkline points={history} />
            <p className="text-sm text-faint">{history[0].at} → {history.at(-1)?.at} · {history.length} ölçüm</p>
          </>
        ) : (
          <p className="mt-4 text-ink-2">Seyir için en az iki ölçüm gerekiyor; profil düzenli tazelendikçe çizgi oluşur.</p>
        )}
      </div>
    </section>
  );
}

export function Collaborations({ a }: { a: Analysis }) {
  return (
    <section>
      <h2 className="font-serif text-3xl">Paylaşımlardaki iş birlikleri</h2>
      <p className="mt-3 max-w-2xl text-ink-2">
        İncelenen paylaşımların %{a.paid_share}&apos;ında iş birliği izi var (ücretli ortaklık etiketi, ortak yayın ya da #işbirliği/#reklam).
      </p>
      {a.partners.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {a.partners.map((p) => (
            <li key={p.account}>
              <a href={`https://www.instagram.com/${p.account}/`} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border border-line px-4 py-1.5 transition-colors hover:border-pink hover:text-pink">
                @{p.account} <span className="text-faint">· {p.posts}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
