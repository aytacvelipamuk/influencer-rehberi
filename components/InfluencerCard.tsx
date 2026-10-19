import Link from "next/link";
import { formatCount, formatEr, PLATFORM_NAMES, shortSegment, TIER_NAMES } from "@/lib/format";
import { metin } from "@/lib/metinler";
import type { Influencer } from "@/lib/types";
import { Avatar } from "./Avatar";

const T = metin.row;

interface RowProps {
  r: Influencer;
  segments: Record<string, string>;
}

/** Dizin satırı: dergi içindekiler gibi — kart içinde kart yok, çizgiyle ayrılır. */
export function InfluencerRow({ r, segments }: RowProps) {
  const name = r.display_name || r.handle;
  return (
    <Link href={`/i/${r.platform}/${r.handle}`} className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 py-5 md:grid-cols-[auto_minmax(0,2fr)_minmax(0,1.4fr)_6rem_6rem_minmax(0,1.6fr)] md:gap-x-6">
      <span className="zoom-frame rounded-full">
        <Avatar src={r.avatar} name={name} size={56} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 truncate text-lg font-medium transition-colors group-hover:text-pink">
          <span className="truncate">{name}</span>
          {r.verified && <span className="text-pink" title={T.verified}>✓</span>}
        </span>
        <span className="block truncate text-sm text-faint">@{r.handle} · {PLATFORM_NAMES[r.platform]}</span>
      </span>
      <span className="col-span-2 truncate text-sm text-ink-2 md:col-span-1">
        {[r.tier && (TIER_NAMES[r.tier]?.split(" ")[0] ?? r.tier), ...r.segments.slice(0, 2).map((s) => shortSegment(segments[s] ?? s))]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <Metric label={T.followers} value={formatCount(r.followers)} />
      <Metric label={T.engagement} value={formatEr(r.er)} />
      <span className="col-span-2 truncate text-sm text-ink-2 md:col-span-1">
        {r.pool === "trendyol" && <span className="mr-2 font-medium text-pink">{T.collection}</span>}
        {r.analysis?.quality.score != null && <span className="mr-2 text-ink">{T.quality(r.analysis.quality.score)}</span>}
        {r.brands.slice(0, 3).join(", ")}
      </span>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="hidden text-right tabular-nums md:block">
      <span className="block text-lg">{value}</span>
      <span className="block text-xs text-faint">{label}</span>
    </span>
  );
}

export function Chip({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm ${strong ? "bg-pink-soft text-pink-dark" : "border border-line text-ink-2"}`}>
      {children}
    </span>
  );
}
