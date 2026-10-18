/**
 * Bright Data Dataset API istemcisi (https://docs.brightdata.com/scraping-automation/web-data-apis).
 * Fiyat (Ekim 2026, ölçüldü): kayıt başına ~$0,0015. Her iş (snapshot) diske yazılır — ağ koparsa ödenmiş veri kaybolmaz.
 */
export const DATASETS = {
  profiles: "gd_l1vikfch901nx3by4", // Instagram - Profiles: takipçi, bio, son 12 gönderi (görselli), öne çıkan hikâyeler
  posts: "gd_lk5ns7kz21pck8jpis", // Instagram - Posts: beğeni, yorum, metin, son yorumlar, ortaklık
  reels: "gd_lyclm20il4r5helnj", // Instagram - Reels: izlenme ve süre (beğenisi güvenilmez, kullanılmaz)
} as const;
export const PRICE_PER_RECORD_USD = 0.0015;

const BASE = "https://api.brightdata.com/datasets/v3";
const POLL_MS = 15_000;
const MAX_POLLS = 160; // ~40 dk

export type Row = Record<string, unknown>;

export class BrightData {
  constructor(private readonly key: string) {}

  private async request(url: string, init: RequestInit = {}): Promise<unknown> {
    const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", ...init.headers } });
    if (!res.ok) throw new Error(`Bright Data ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }

  async trigger(kind: keyof typeof DATASETS, handles: string[], perAccount?: number): Promise<string> {
    const discover = kind === "posts" ? "url" : kind === "reels" ? "url_all_reels" : null;
    const query = discover ? `&type=discover_new&discover_by=${discover}&limit_per_input=${perAccount}` : "";
    const body = handles.map((h) => ({ url: `https://www.instagram.com/${h}` }));
    const res = (await this.request(`${BASE}/trigger?dataset_id=${DATASETS[kind]}&include_errors=true${query}`, {
      method: "POST", body: JSON.stringify(body),
    })) as { snapshot_id: string };
    return res.snapshot_id;
  }

  /** Hazır olana kadar bekler; ağ hatasında vazgeçmez (iş Bright Data'da ücretlendi). */
  async results(snapshotId: string, log: (m: string) => void = () => undefined): Promise<Row[]> {
    for (let i = 0; i < MAX_POLLS; i++) {
      try {
        const p = (await this.request(`${BASE}/progress/${snapshotId}`)) as { status: string };
        if (p.status === "ready") {
          const rows = await this.request(`${BASE}/snapshot/${snapshotId}?format=json`);
          return Array.isArray(rows) ? (rows as Row[]).filter((r) => r && typeof r === "object") : [];
        }
        if (p.status === "failed" || p.status === "error") throw new Error(`İş başarısız: ${snapshotId}`);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("İş başarısız")) throw e;
        log(`  ağ hatası, beklemeye devam: ${(e as Error).message.slice(0, 80)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    throw new Error(`Zaman aşımı: ${snapshotId} — 'npm run topla -- --devam' ile sonra alınabilir`);
  }
}
