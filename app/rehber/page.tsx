import type { Metadata } from "next";
import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { InfluencerRow } from "@/components/InfluencerCard";
import { loadSnapshot } from "@/lib/data";
import { formatWhole } from "@/lib/format";
import { metin } from "@/lib/metinler";
import { parseFilters, search, toQuery } from "@/lib/query";

const T = metin.directory;

export const metadata: Metadata = { title: T.metaTitle, description: T.metaDescription };

export default async function DirectoryPage({ searchParams }: PageProps<"/rehber">) {
  const { influencers, labels } = await loadSnapshot();
  const tiers = labels.tiers.map((t) => t.key);
  const filters = parseFilters(await searchParams, labels.segments, tiers);
  const result = search(influencers, filters);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 md:px-8">
      <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] leading-none">{T.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">
        {T.intro(formatWhole(influencers.length))}
      </p>

      <div className="sticky top-16 z-30 -mx-4 border-b border-line px-4 md:-mx-8 md:px-8">
        <FilterBar segments={labels.segments} tiers={tiers} />
      </div>

      <p className="mt-6 text-sm text-ink-2" aria-live="polite">
        <span className="font-medium text-ink">{formatWhole(result.total)}</span> {T.results}
        {result.pages > 1 && T.pageOf(result.page, result.pages)}
      </p>

      {result.rows.length ? (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {result.rows.map((r) => (
            <li key={`${r.platform}:${r.handle}`}>
              <InfluencerRow r={r} segments={labels.segments} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl bg-blush p-12 text-center text-ink-2">
          {T.emptyBefore}{" "}
          <Link href="/eslestir" className="text-pink underline">{T.emptyLink}</Link>.
        </div>
      )}

      {result.pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label={T.pagesLabel}>
          {result.page > 1 && (
            <Link href={`/rehber${toQuery(filters, { sayfa: String(result.page - 1) })}`} className="rounded-full border border-line px-5 py-2.5 hover:border-pink">{T.previous}</Link>
          )}
          <span className="text-sm text-ink-2 tabular-nums">{result.page} / {result.pages}</span>
          {result.page < result.pages && (
            <Link href={`/rehber${toQuery(filters, { sayfa: String(result.page + 1) })}`} className="rounded-full border border-line px-5 py-2.5 hover:border-pink">{T.next}</Link>
          )}
        </nav>
      )}
    </div>
  );
}
