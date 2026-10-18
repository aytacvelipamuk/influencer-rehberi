/**
 * Etkileşim ölçüleri — saf fonksiyonlar, veritabanı yok. Kendi projenize doğrudan alabilirsiniz.
 *
 * Etkileşim oranı (E.R.) = (beğeni + yorum) / takipçi × 100, son gönderilerin MEDYANI (ortalama değil:
 * tek viral gönderi oranı şişirmesin).
 */

/** Takipçi bandına göre beklenen etkileşim yüzdesi: küçük hesapların kitlesi daha çok tepki verir. */
export const ENGAGEMENT_BANDS: readonly [maxFollowers: number, rate: number][] = [
  [5_000, 5.0],
  [20_000, 3.0],
  [100_000, 2.0],
  [500_000, 1.2],
  [1_000_000, 0.9],
];
export const LARGE_ACCOUNT_ENGAGEMENT = 0.7;

export function expectedEngagement(followers: number | null): number | null {
  if (!followers) return null;
  return ENGAGEMENT_BANDS.find(([max]) => followers < max)?.[1] ?? LARGE_ACCOUNT_ENGAGEMENT;
}

export interface PostMetrics {
  likes: number | null;
  comments: number | null;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Gönderi başına E.R.'lerin medyanı (%); beğenisi bilinmeyen gönderi ölçüye girmez. */
export function engagementRate(posts: PostMetrics[], followers: number | null): number | null {
  if (!followers) return null;
  const rates = posts.filter((p) => p.likes !== null).map((p) => ((p.likes ?? 0) + (p.comments ?? 0)) / followers * 100);
  const m = median(rates);
  return m === null ? null : Math.round(m * 100) / 100;
}

export const TIERS: readonly [key: string, from: number, to: number | null][] = [
  ["aday", 0, 1_000],
  ["nano", 1_000, 10_000],
  ["mikro", 10_000, 50_000],
  ["orta", 50_000, 500_000],
  ["makro", 500_000, 1_000_000],
  ["mega", 1_000_000, null],
];

/** HypeAuditor tanımıyla takipçi basamağı. */
export function tier(followers: number | null): string | null {
  if (followers === null) return null;
  return TIERS.find(([, from, to]) => followers >= from && (to === null || followers < to))?.[0] ?? null;
}

/** Haftalık paylaşım sayısı ve son paylaşım (ISO tarihler). */
export function rhythm(dates: (string | null)[]): { per_week: number | null; last_post_at: string | null } {
  const days = dates.filter((d): d is string => !!d).map((d) => new Date(d)).filter((d) => !isNaN(+d)).sort((a, b) => +a - +b);
  if (days.length < 2) return { per_week: null, last_post_at: days.at(-1)?.toISOString() ?? null };
  const spanDays = (+days.at(-1)! - +days[0]) / 86_400_000;
  return {
    per_week: spanDays > 0 ? Math.round(((days.length - 1) / spanDays) * 7 * 10) / 10 : null,
    last_post_at: days.at(-1)!.toISOString(),
  };
}

const SPONSORED_RE = /#?\b(reklam|isbirligi|işbirliği|sponsor\w*|ad|advertisement|paidpartnership)\b/i;

/** Paylaşımda iş birliği izi: ücretli ortaklık etiketi, ortak yayın ya da #işbirliği/#reklam. */
export function isPaid(post: { paid_partnership?: boolean | null; coauthors?: string[] | null; caption?: string | null }): boolean {
  return !!(post.paid_partnership || post.coauthors?.length || SPONSORED_RE.test(post.caption ?? ""));
}
