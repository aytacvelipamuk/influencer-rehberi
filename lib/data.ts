import "server-only";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Influencer, Snapshot } from "./types";

// Veri git'e girmez: toplayıcının (npm run topla) ya da kendi veri hattının dökümü bu klasöre yazılır.
// Klasör yoksa örnek veri (ornek-veri/) okunur — site kutudan çıktığı gibi açılır.
const SAMPLE_DIR = path.resolve("ornek-veri");
/** Yazma her zaman buraya (yayın ucu, toplayıcı) — örnek veri klasörüne asla yazılmaz. */
export const WRITE_DIR = path.resolve(process.env.REHBER_DATA_DIR ?? "data");
/** Okuma: gerçek döküm varsa o, yoksa örnek veri. Her çağrıda bakılır — ilk yüklemeden sonra yeniden başlatma gerekmez. */
export const dataDir = () => (existsSync(path.join(WRITE_DIR, "influencers.json")) ? WRITE_DIR : SAMPLE_DIR);

let cache: { mtimeMs: number; dir: string; snapshot: Snapshot } | null = null;

const EMPTY: Snapshot = {
  generated_at: "",
  count: 0,
  labels: { segments: {}, tiers: [] },
  influencers: [],
};

/** Dökümü okur; dosya değişmedikçe bellekten verir. Dosya yoksa boş döküm (site yine açılır). */
export async function loadSnapshot(): Promise<Snapshot> {
  let mtimeMs: number;
  try {
    mtimeMs = (await stat(path.join(dataDir(), "influencers.json"))).mtimeMs;
  } catch {
    console.error(`[rehber] döküm bulunamadı: ${dataDir()}`);
    return EMPTY;
  }
  if (cache && cache.mtimeMs === mtimeMs && cache.dir === dataDir()) return cache.snapshot;
  const snapshot = JSON.parse(await readFile(path.join(dataDir(), "influencers.json"), "utf8")) as Snapshot;
  cache = { mtimeMs, dir: dataDir(), snapshot };
  return snapshot;
}

export async function findInfluencer(platform: string, handle: string): Promise<Influencer | null> {
  const { influencers } = await loadSnapshot();
  const aranan = handle.toLowerCase();
  return influencers.find((r) => r.platform === platform && r.handle === aranan) ?? null;
}

const REPORT_TOKEN_RE = /^[a-f0-9]{32}$/;

/** Eşleştirme raporu; jeton biçimi doğrulanır (yol dışına çıkılamaz), yoksa null. */
export async function loadReport(token: string): Promise<import("./types").MatchReport | null> {
  if (!REPORT_TOKEN_RE.test(token)) return null;
  try {
    return JSON.parse(await readFile(path.join(dataDir(), "raporlar", `${token}.json`), "utf8"));
  } catch {
    return null;
  }
}
