/**
 * Görsel indirme: Instagram CDN adresleri imzalı ve birkaç günde ölür — dosyalar data/ altına indirilir.
 * Profil fotoğrafı, en yeni 6 paylaşımın görseli (TikTok'ta video kapağı) ve öne çıkan hikâye kapakları. 8 paralel indirme.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Row } from "./brightdata";
import { type Account, type Extra, accountKey } from "./build";

const WORKERS = 8;
const THUMBS = 6;
const SAFE = /^[0-9A-Za-z._-]{1,80}$/;

async function save(url: string | null, file: string): Promise<boolean> {
  if (!url) return false;
  if (existsSync(file)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 512) return false;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, buf);
    return true;
  } catch {
    return false;
  }
}

async function pool<T>(items: T[], fn: (t: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: WORKERS }, async () => { for (let t = queue.shift(); t; t = queue.shift()) await fn(t); }));
}

export async function downloadAll(dataDir: string, accounts: Account[]): Promise<Map<string, Extra>> {
  const out = new Map<string, Extra>();
  await pool(accounts, async (a) => {
    if (!SAFE.test(a.handle)) return;
    const p = (a.profile ?? {}) as Row;
    const x: Extra = { thumbs: {}, highlights: [] };
    const avatarUrl = (p.profile_image_link ?? p.profile_pic_url_hd ?? p.profile_pic_url) as string | undefined;
    if (await save(avatarUrl ?? null, path.join(dataDir, "avatars", a.platform, `${a.handle}.jpg`))) {
      x.avatar = `avatars/${a.platform}/${a.handle}.jpg`;
    }
    const newest = [...a.posts.values()].sort((m, n) => (n.posted_at ?? "").localeCompare(m.posted_at ?? "")).slice(0, THUMBS);
    for (const q of newest) {
      if (SAFE.test(q.post_id) && (await save(q.thumbnail, path.join(dataDir, "posts", `${q.post_id}.jpg`)))) x.thumbs![q.post_id] = `posts/${q.post_id}.jpg`;
    }
    for (const h of ((p.highlights as Row[] | undefined) ?? [])) {
      const id = String(h.id ?? "");
      const ok = SAFE.test(id) && (await save(h.image as string, path.join(dataDir, "highlights", `${id}.jpg`)));
      x.highlights!.push({ title: (h.title as string) ?? null, cover: ok ? `highlights/${id}.jpg` : null, url: (h.highlight_url as string) ?? null });
    }
    out.set(accountKey(a.platform, a.handle), x);
  });
  return out;
}
