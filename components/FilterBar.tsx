"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PLATFORM_NAMES, POOL_NAMES, shortSegment, TIER_NAMES } from "@/lib/format";
import { metin } from "@/lib/metinler";

const DEBOUNCE_MS = 300;
const T = metin.filters;
const SORTS = Object.entries(T.sorts);
const ER_STEPS = ["1", "2", "3", "5"];
const QUALITY_STEPS = ["40", "60", "80"];

export function FilterBar({ segments, tiers }: { segments: Record<string, string>; tiers: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("sayfa");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update("q", q.trim() || null), DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnız yazı değişince
  }, [q]);

  const select = (key: string, label: string, options: [string, string][], placeholder: string) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-ink-2">{label}</span>
      <select
        value={params.get(key) ?? ""}
        onChange={(e) => update(key, e.target.value || null)}
        className="h-11 rounded-lg border border-line bg-paper px-3 text-[0.95rem] text-ink transition-colors hover:border-pink"
      >
        <option value="">{placeholder}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="flex flex-col gap-4 bg-paper py-4" aria-busy={pending}>
      <label className="relative block">
        <span className="sr-only">{T.searchLabel}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T.searchPlaceholder}
          className="h-14 w-full rounded-full border border-line bg-blush px-6 pr-12 text-base text-ink placeholder:text-faint transition-colors focus:border-pink"
        />
        <span
          className={`absolute top-1/2 right-4 size-5 -translate-y-1/2 rounded-full border-2 border-pink border-t-transparent transition-opacity ${
            pending ? "animate-spin opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
      </label>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {select("kategori", T.segment, Object.entries(segments).map(([k, v]) => [k, shortSegment(v)]), T.all)}
        {select("basamak", T.tier, tiers.map((t) => [t, TIER_NAMES[t] ?? t]), T.all)}
        {select("platform", T.platform, Object.entries(PLATFORM_NAMES), T.bothPlatforms)}
        {select("havuz", T.pool, Object.entries(POOL_NAMES), T.any)}
        {select("min_er", T.minEr, ER_STEPS.map((s) => [s, T.erStep(s)]), T.any)}
        {select("min_kalite", T.minQuality, QUALITY_STEPS.map((s) => [s, T.qualityStep(s)]), T.any)}
        {select("sirala", T.sort, SORTS, T.sorts.followers)}
      </div>
    </div>
  );
}
