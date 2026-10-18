/**
 * Bright Data satırları → sitenin okuduğu kayıt (lib/types.ts Influencer). Saf fonksiyonlar, testli.
 */
import { commentQuality } from "../../lib/scoring/comments";
import { engagementRate, expectedEngagement, isPaid, rhythm, tier } from "../../lib/scoring/engagement";
import {
  commentRatioComponent, commentsComponent, consistencyComponent, engagementComponent, followingComponent,
  growthComponent, score, viewsComponent,
} from "../../lib/scoring/quality";
import type { Influencer } from "../../lib/types";
import type { Row } from "./brightdata";
import { classify } from "./segments";

const RECENT = 6;
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : null);
const handleOf = (r: Row) => (str(r.account) ?? str(r.user_posted) ?? "").replace(/^@/, "").toLowerCase();

export interface Post {
  post_id: string;
  url: string | null;
  kind: string | null;
  caption: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  posted_at: string | null;
  thumbnail: string | null;
  paid: boolean;
  tagged: string[];
  comment_texts: string[];
}

export interface Account {
  handle: string;
  profile: Row | null;
  posts: Map<string, Post>;
}

const users = (v: unknown) =>
  Array.isArray(v) ? v.map((u) => (typeof u === "string" ? u : str((u as Row)?.username) ?? str((u as Row)?.profile_name))).filter((u): u is string => !!u) : [];

export function addProfile(acc: Map<string, Account>, r: Row) {
  const h = handleOf(r);
  if (!h || r.error_code) return;
  const a = acc.get(h) ?? { handle: h, profile: null, posts: new Map() };
  a.profile = r;
  for (const p of (r.posts as Row[] | undefined) ?? []) {
    const id = String(p.id ?? "");
    if (!id || a.posts.has(id)) continue;
    a.posts.set(id, { post_id: id, url: str(p.url), kind: str(p.content_type), caption: str(p.caption), likes: null, comments: null,
      views: null, posted_at: str(p.datetime), thumbnail: str(p.image_url), paid: isPaid({ caption: str(p.caption) }), tagged: [], comment_texts: [] });
  }
  acc.set(h, a);
}

export function addPost(acc: Map<string, Account>, r: Row) {
  const h = handleOf(r);
  const id = String(r.post_id ?? "");
  if (!h || !id || r.error_code) return;
  const a = acc.get(h) ?? { handle: h, profile: null, posts: new Map() };
  const prev = a.posts.get(id);
  const caption = str(r.description) ?? str(r.caption) ?? str(r.post_content);
  const coauthors = [...users(r.coauthor_producers), ...users(r.partnership_details)];
  a.posts.set(id, {
    post_id: id, url: str(r.url) ?? prev?.url ?? null, kind: str(r.content_type) ?? prev?.kind ?? null,
    caption: caption ?? prev?.caption ?? null, likes: num(r.likes), comments: num(r.num_comments), views: prev?.views ?? null,
    posted_at: str(r.date_posted) ?? prev?.posted_at ?? null, thumbnail: str(r.thumbnail) ?? prev?.thumbnail ?? null,
    paid: isPaid({ paid_partnership: r.is_paid_partnership === true, coauthors, caption }),
    tagged: [...new Set([...users(r.tagged_users), ...coauthors])],
    comment_texts: ((r.latest_comments as Row[] | undefined) ?? []).map((c) => str(c.comments)).filter((c): c is string => !!c),
  });
  acc.set(h, a);
}

export function addReel(acc: Map<string, Account>, r: Row) {
  const h = handleOf(r);
  const id = String(r.post_id ?? "");
  if (!h || !id || r.error_code) return;
  const a = acc.get(h) ?? { handle: h, profile: null, posts: new Map() };
  const prev = a.posts.get(id);
  a.posts.set(id, {
    post_id: id, url: str(r.url) ?? prev?.url ?? null, kind: "Reel", caption: prev?.caption ?? str(r.description),
    likes: prev?.likes ?? null, comments: prev?.comments ?? null, views: num(r.views) ?? num(r.video_play_count),
    posted_at: prev?.posted_at ?? str(r.date_posted), thumbnail: prev?.thumbnail ?? str(r.thumbnail),
    paid: prev?.paid ?? false, tagged: prev?.tagged ?? [], comment_texts: prev?.comment_texts ?? [],
  });
  acc.set(h, a);
}

export interface Extra {
  segments?: string[];
  brands?: string[];
  history?: number[];
  avatar?: string | null;
  thumbs?: Record<string, string>;
  highlights?: { title: string | null; cover: string | null; url: string | null }[];
}

export function toInfluencer(a: Account, x: Extra = {}, now = new Date().toISOString()): Influencer {
  const p = a.profile ?? {};
  const followers = num(p.followers);
  const posts = [...a.posts.values()].sort((m, n) => (n.posted_at ?? "").localeCompare(m.posted_at ?? ""));
  const measured = posts.filter((q) => q.likes !== null).slice(0, 12);
  const er = engagementRate(measured, followers);
  const avg = (v: number[]) => (v.length ? v.reduce((s, y) => s + y, 0) / v.length : null);
  const likes = measured.map((q) => q.likes ?? 0);
  const reelViews = posts.filter((q) => q.kind === "Reel" && q.views).map((q) => q.views!);
  const partners = new Map<string, number>();
  for (const q of posts) for (const t of q.tagged) partners.set(t, (partners.get(t) ?? 0) + 1);
  const mix: Record<string, number> = {};
  for (const q of posts) if (q.kind) mix[q.kind] = (mix[q.kind] ?? 0) + 1;
  const history = [...(x.history ?? []), ...(followers ? [followers] : [])];
  const quality = score([
    engagementComponent(er, followers),
    commentsComponent(commentQuality(posts.flatMap((q) => q.comment_texts))),
    commentRatioComponent(avg(likes), avg(measured.map((q) => q.comments ?? 0))),
    followingComponent(num(p.following), followers),
    growthComponent(history),
    consistencyComponent(likes),
    viewsComponent(reelViews, followers),
  ]);
  const text = [str(p.biography), ...posts.map((q) => q.caption)].filter(Boolean).join(" ");
  return {
    handle: a.handle, platform: "instagram", pool: x.brands?.length ? "trendyol" : "bagimsiz",
    display_name: str(p.profile_name) ?? str(p.full_name), followers, tier: tier(followers), er, er_posts: measured.length,
    segments: x.segments?.length ? x.segments : classify(text), marketplaces: [], verified: p.is_verified === true,
    bio: str(p.biography), business_category: str(p.business_category_name), collection_url: null, brands: x.brands ?? [],
    avatar: x.avatar ?? null, profile_url: `https://www.instagram.com/${a.handle}/`, first_seen_at: now,
    analysis: posts.length ? {
      quality,
      recent: posts.slice(0, RECENT).map((q) => ({ url: q.url ?? "", kind: q.kind, thumb: x.thumbs?.[q.post_id] ?? null, likes: q.likes,
        comments: q.comments, views: q.views, posted_at: q.posted_at, paid: q.paid, caption: q.caption?.slice(0, 140) ?? null })),
      rhythm: rhythm(posts.slice(0, 12).map((q) => q.posted_at)), mix,
      reels_avg_views: reelViews.length ? Math.round(avg(reelViews)!) : null,
      paid_share: Math.round((posts.filter((q) => q.paid).length / posts.length) * 100),
      partners: [...partners.entries()].sort((m, n) => n[1] - m[1]).slice(0, 8).map(([account, n]) => ({ account, posts: n })),
      posts_measured: posts.length, followers_history: history.map((f, i) => ({ at: `ölçüm ${i + 1}`, followers: f })),
      expected_er: expectedEngagement(followers), highlights: x.highlights ?? [],
    } : null,
  };
}
