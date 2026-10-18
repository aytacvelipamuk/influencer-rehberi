import type { Influencer } from "./types";

export function brandCount(rows: Influencer[]) {
  return new Set(rows.flatMap((r) => r.brands)).size;
}

/** Yüz duvarı: fotoğrafı olan, en çok markayla çalışan hesaplar (aynı sıra her derlemede). */
export function faceWall(rows: Influencer[], n: number) {
  return rows
    .filter((r) => r.avatar)
    .sort((a, b) => b.brands.length - a.brands.length || (b.followers ?? 0) - (a.followers ?? 0))
    .slice(0, n);
}

export function segmentCounts(rows: Influencer[]) {
  const count = new Map<string, number>();
  for (const r of rows) for (const s of r.segments) count.set(s, (count.get(s) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]);
}
