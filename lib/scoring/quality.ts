/**
 * Kitle Kalitesi (tahmin, 0-100): sahte/ilgisiz takipçi ve şişirilmiş etkileşim işaretleri.
 *
 * Takipçi listesine erişilmeden, herkese açık dolaylı sinyallerden kurulur. Her bileşen kendi değeri ve
 * gerekçesiyle döner; verisi olmayan bileşen puana girmez, puan kalanların en yüksek toplamına ölçeklenir.
 * MIN_COMPONENTS'ten az bileşen varsa puan verilmez — iki sinyalden kalite puanı uydurmak yanıltır.
 *
 * Ağırlıklar (en yüksek puan): etkileşim/beklenen 30 · yorum gerçekliği 20 · yorum/beğeni 10 ·
 * takip/takipçi 10 · takipçi sıçraması 10 · beğeni dağılımı 10 · Reels izlenme/takipçi 10.
 */
import type { CommentQuality } from "./comments";
import { expectedEngagement } from "./engagement";

export interface Component {
  key: string;
  label: string;
  max: number;
  points: number;
  value: number;
  note: string;
}

export interface QualityResult {
  score: number | null;
  label: string;
  components: Component[];
}

export const MIN_COMPONENTS = 3;
const MIN_POSTS = 3;
const LABELS: [number, string][] = [[75, "Yüksek"], [50, "Orta"], [0, "Düşük"]];
const ER_LOW_RATIO = 0.6, ER_POD_RATIO = 4.0;
const COMMENT_RATIO_LOW = 0.2, COMMENT_RATIO_HIGH = 10.0;
const FOLLOWING_OK = 0.5, FOLLOWING_BAD = 1.5;
const GROWTH_SPIKE = 0.2;
const LIKES_CV_FLAT = 0.15;
const VIEWS_GOOD = 0.3, VIEWS_LOW = 0.05;

const n = (x: number) => Math.round(x).toLocaleString("tr-TR");
const comp = (key: string, label: string, max: number, points: number, value: number, note: string): Component => ({
  key, label, max, points: Math.round(Math.max(0, Math.min(points, max)) * 10) / 10, value, note,
});
const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;

export function engagementComponent(er: number | null, followers: number | null): Component | null {
  const expected = expectedEngagement(followers);
  if (er === null || !expected) return null;
  const ratio = er / expected;
  if (ratio > ER_POD_RATIO) {
    return comp("etkilesim", "Etkileşim / beklenen", 30, 12, +ratio.toFixed(2),
      `Etkileşim takipçi bandının ${ratio.toFixed(1)} katı: etkileşim grubu ya da tek viral gönderi olabilir`);
  }
  const points = ratio < ER_LOW_RATIO ? 30 * (ratio / ER_LOW_RATIO) : 30;
  return comp("etkilesim", "Etkileşim / beklenen", 30, points, +ratio.toFixed(2),
    `%${er.toFixed(2)} etkileşim, bu büyüklükte beklenen %${expected.toFixed(1)}: ${ratio < ER_LOW_RATIO ? "beklenenin altında" : "beklenen düzeyde ya da üstünde"}`);
}

export function commentsComponent(q: CommentQuality | null): Component | null {
  if (!q || q.comments_measured < 10 || q.authentic_share === null) return null;
  const points = (20 * q.authentic_share) / 100 - ((q.repeat_share ?? 0) > 30 ? 5 : 0);
  return comp("yorum", "Yorum gerçekliği", 20, points, q.authentic_share,
    `${q.comments_measured} yorumdan %${q.authentic_share.toFixed(0)} gerçek cümle, %${(q.repeat_share ?? 0).toFixed(0)} tekrar`);
}

export function commentRatioComponent(avgLikes: number | null, avgComments: number | null): Component | null {
  if (!avgLikes || avgComments === null) return null;
  const pct = (avgComments / avgLikes) * 100;
  if (pct < COMMENT_RATIO_LOW) return comp("oran", "Yorum / beğeni", 10, 3, +pct.toFixed(2), `Beğeniye göre yorum çok az (%${pct.toFixed(2)}): beğeni şişirilmiş olabilir`);
  if (pct > COMMENT_RATIO_HIGH) return comp("oran", "Yorum / beğeni", 10, 4, +pct.toFixed(2), `Beğeniye göre yorum çok fazla (%${pct.toFixed(1)}): çekiliş ya da yorum grubu olabilir`);
  return comp("oran", "Yorum / beğeni", 10, 10, +pct.toFixed(2), `Yorum/beğeni %${pct.toFixed(1)}: olağan aralıkta`);
}

export function followingComponent(following: number | null, followers: number | null): Component | null {
  if (!followers || following === null) return null;
  const ratio = following / followers;
  const points = ratio <= FOLLOWING_OK ? 10 : ratio >= FOLLOWING_BAD ? 0 : (10 * (FOLLOWING_BAD - ratio)) / (FOLLOWING_BAD - FOLLOWING_OK);
  return comp("takip", "Takip / takipçi", 10, points, +ratio.toFixed(2), `${n(following)} hesabı takip ediyor, ${n(followers)} takipçisi var`);
}

/** series: takipçi ölçümleri eskiden yeniye. */
export function growthComponent(series: number[]): Component | null {
  const s = series.filter((x) => x > 0);
  if (s.length < 2) return null;
  const spike = Math.max(...s.slice(1).map((b, i) => b / s[i] - 1));
  if (spike >= GROWTH_SPIKE) {
    return comp("buyume", "Takipçi artışı", 10, 3, +(spike * 100).toFixed(1), `İki ölçüm arasında %${(spike * 100).toFixed(0)} sıçrama: satın alma ya da viral içerik — gönderilere bak`);
  }
  return comp("buyume", "Takipçi artışı", 10, 10, +(spike * 100).toFixed(1), `${s.length} ölçümde düzenli seyir`);
}

export function consistencyComponent(likes: number[]): Component | null {
  const v = likes.filter((x) => x > 0);
  if (v.length < MIN_POSTS) return null;
  const m = mean(v);
  const cv = Math.sqrt(mean(v.map((x) => (x - m) ** 2))) / m;
  if (cv < LIKES_CV_FLAT) {
    return comp("tutarlilik", "Beğeni dağılımı", 10, 4, +cv.toFixed(2), "Gönderilerin beğenisi neredeyse aynı: doğal kitlede dalgalanma olur, satın alınmış beğeni izi olabilir");
  }
  return comp("tutarlilik", "Beğeni dağılımı", 10, 10, +cv.toFixed(2), "Gönderiden gönderiye doğal dalgalanma var");
}

export function viewsComponent(reelViews: number[], followers: number | null): Component | null {
  const v = reelViews.filter((x) => x > 0);
  if (!v.length || !followers) return null;
  const ratio = mean(v) / followers;
  const points = ratio >= VIEWS_GOOD ? 10 : ratio < VIEWS_LOW ? 2 : 2 + (8 * (ratio - VIEWS_LOW)) / (VIEWS_GOOD - VIEWS_LOW);
  return comp("izlenme", "Reels izlenme / takipçi", 10, points, +ratio.toFixed(2), `Reels başına ortalama ${n(mean(v))} izlenme (takipçi sayısına oranı %${(ratio * 100).toFixed(0)})`);
}

export function score(components: (Component | null)[]): QualityResult {
  const c = components.filter((x): x is Component => x !== null);
  if (c.length < MIN_COMPONENTS) return { score: null, label: "Yetersiz veri", components: c };
  const s = Math.round((c.reduce((t, x) => t + x.points, 0) / c.reduce((t, x) => t + x.max, 0)) * 100);
  return { score: s, label: LABELS.find(([min]) => s >= min)![1], components: c };
}
