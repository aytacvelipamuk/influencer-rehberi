export type Platform = "instagram" | "tiktok";
export type Pool = "trendyol" | "bagimsiz";

export interface Influencer {
  handle: string;
  platform: Platform;
  pool: Pool;
  display_name: string | null;
  followers: number | null;
  tier: string | null;
  er: number | null;
  er_posts: number;
  segments: string[];
  marketplaces: string[];
  verified: boolean;
  bio: string | null;
  business_category: string | null;
  collection_url: string | null;
  brands: string[];
  avatar: string | null;
  profile_url: string;
  first_seen_at: string | null;
  analysis: Analysis | null;
}

export interface TierLabel {
  key: string;
  from: number;
  to: number | null;
}

export interface Snapshot {
  generated_at: string;
  count: number;
  labels: { segments: Record<string, string>; tiers: TierLabel[] };
  influencers: Influencer[];
}

export type SortKey = "followers" | "er" | "brands" | "newest";

export interface Filters {
  q: string;
  platform: Platform | null;
  pool: Pool | null;
  tier: string | null;
  segment: string | null;
  minEr: number | null;
  brand: string | null;
  sort: SortKey;
  page: number;
}

export interface Recommendation {
  handle: string;
  platform: Platform;
  score: number;
  evidence: string;
  reasons: string[];
  warnings: string[];
  brands: string[];
  followers: number | null;
  tier: string | null;
  er: number | null;
}

export interface MatchReport {
  token: string;
  created_at: string;
  store: {
    merchant_id: string;
    store_name: string | null;
    categories: { name: string; key: string; products: number }[];
    brands: string[];
    median_price: number | null;
    product_count: number;
    products: { name: string; brand: string; price: number | null; url: string }[];
  };
  scope: { key: string | null; title: string };
  competitors: { brand: string; products: number; influencers: number }[];
  evidence_counts: Record<string, number>;
  candidates: number;
  recommendations: Recommendation[];
}

export interface QualityComponent {
  key: string;
  label: string;
  max: number;
  points: number;
  value: number;
  note: string;
}

export interface RecentPost {
  url: string;
  kind: string | null;
  thumb: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  posted_at: string | null;
  paid: boolean;
  caption: string | null;
}

export interface Analysis {
  quality: { score: number | null; label: string; components: QualityComponent[] };
  recent: RecentPost[];
  rhythm: { per_week: number | null; last_post_at: string | null };
  mix: Record<string, number>;
  reels_avg_views: number | null;
  paid_share: number;
  partners: { account: string; posts: number }[];
  posts_measured: number;
  followers_history: { at: string; followers: number }[];
  expected_er: number | null;
  highlights: { title: string | null; cover: string | null; url: string | null }[];
}
