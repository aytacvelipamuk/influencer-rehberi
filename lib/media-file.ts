import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "./data";

const MEDIA_FILE_RE = /^[0-9A-Za-z_-]{1,40}\.jpg$/;
const ONE_WEEK_S = 604_800;

/** Kalıcı diskteki medya görselini sunar; ad doğrulanır, klasör dışına çıkılamaz. */
export async function serveMedia(kind: "posts" | "highlights", file: string): Promise<Response> {
  if (!MEDIA_FILE_RE.test(file)) return new Response("Bulunamadı", { status: 404 });
  try {
    const body = await readFile(path.join(dataDir(), kind, file));
    return new Response(body, { headers: { "Content-Type": "image/jpeg", "Cache-Control": `public, max-age=${ONE_WEEK_S}` } });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
