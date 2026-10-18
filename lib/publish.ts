import "server-only";
import { timingSafeEqual } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { WRITE_DIR as DATA_DIR } from "./data";

// Uzaktaki veri hattı → site yayın kapısı (toplayıcı başka makinede çalışıyorsa). Jeton yoksa kapalı (503): yanlış yapılandırma veriyi açmasın.
const TOKEN = process.env.REHBER_YAYIN_TOKEN ?? "";
const TALEP_DIR = path.resolve(process.env.REHBER_TALEP_DIR ?? "talepler");
export const AVATAR_FILE_RE = /^[a-z0-9._-]{1,80}\.(jpg|jpeg|png|webp)$/;
export const PLATFORM_RE = /^(instagram|tiktok)$/;
export const MAX_AVATAR_BYTES = 1_000_000;
export const TALEP_KINDS = ["eslestir", "kaldir"] as const;
export const REPORT_TOKEN_RE = /^[a-f0-9]{32}$/;
const MAX_REPORT_BYTES = 2_000_000;

export function authorize(req: Request): Response | null {
  if (!TOKEN) return Response.json({ success: false, error: "yayin_kapali" }, { status: 503 });
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const a = Buffer.from(given);
  const b = Buffer.from(TOKEN);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ success: false, error: "yetkisiz" }, { status: 401 });
  return null;
}

/** Yarım yazılmış dosyayı site okumasın diye önce geçici dosya, sonra yeniden adlandırma. */
async function atomicWrite(file: string, data: string | Uint8Array) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, data);
  await rename(tmp, file);
}

export function validSnapshot(body: unknown): body is { count: number; influencers: unknown[]; labels: object } {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return Array.isArray(b.influencers) && b.count === b.influencers.length && typeof b.labels === "object";
}

export const writeSnapshot = (json: string) => atomicWrite(path.join(DATA_DIR, "influencers.json"), json);

export const MEDIA_FILE_RE = /^[0-9A-Za-z_-]{1,40}\.jpg$/;
export const MEDIA_KINDS = ["posts", "highlights"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];
export const isMediaKind = (k: string): k is MediaKind => (MEDIA_KINDS as readonly string[]).includes(k);

export const writeMedia = (kind: MediaKind, file: string, bytes: Uint8Array) => atomicWrite(path.join(DATA_DIR, kind, file), bytes);

export async function listMedia(kind: MediaKind): Promise<string[]> {
  try {
    return await readdir(path.join(DATA_DIR, kind));
  } catch {
    return [];
  }
}

export const writeAvatar = (platform: string, file: string, bytes: Uint8Array) =>
  atomicWrite(path.join(DATA_DIR, "avatars", platform, file), bytes);

export async function listAvatars(platform: string): Promise<string[]> {
  try {
    return await readdir(path.join(DATA_DIR, "avatars", platform));
  } catch {
    return [];
  }
}

export async function readRequests(kind: (typeof TALEP_KINDS)[number]): Promise<string> {
  try {
    return await readFile(path.join(TALEP_DIR, `${kind}.jsonl`), "utf8");
  } catch {
    return "";
  }
}

export function validReport(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return typeof b.token === "string" && REPORT_TOKEN_RE.test(b.token) && Array.isArray(b.recommendations) && typeof b.store === "object";
}

export async function writeReport(token: string, json: string) {
  if (json.length > MAX_REPORT_BYTES) throw new Error("rapor çok büyük");
  await atomicWrite(path.join(DATA_DIR, "raporlar", `${token}.json`), json);
}
