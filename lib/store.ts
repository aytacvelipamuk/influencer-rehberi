import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Talepler git dışında, kalıcı diskte: veri hattı buradan çeker (eşleştirme) ya da elle işlenir (kaldırma).
const TALEP_DIR = path.resolve(process.env.REHBER_TALEP_DIR ?? "talepler");
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/** IP başına saatte en çok 5 talep (bellekte; tek süreçli sunucu için yeterli). */
export function allowed(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  hits.set(ip, [...recent, now]);
  return true;
}

export async function saveRequest(kind: "eslestir" | "kaldir", record: Record<string, unknown>) {
  await mkdir(TALEP_DIR, { recursive: true });
  const line = JSON.stringify({ ...record, kind, created_at: new Date().toISOString() });
  await appendFile(path.join(TALEP_DIR, `${kind}.jsonl`), `${line}\n`, "utf8");
}

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "yerel";
}
