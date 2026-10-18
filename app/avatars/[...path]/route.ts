import { readFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "@/lib/data";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const ONE_DAY_S = 86_400;

/** Profil fotoğrafları git dışında, döküm klasöründe; yalnız avatars/ altı ve bilinen uzantılar okunur. */
export async function GET(_req: Request, ctx: RouteContext<"/avatars/[...path]">) {
  const parts = (await ctx.params).path;
  const root = path.join(dataDir(), "avatars");
  const file = path.resolve(root, ...parts);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || !file.startsWith(root + path.sep)) return new Response("Bulunamadı", { status: 404 });
  try {
    const body = await readFile(file);
    return new Response(body, { headers: { "Content-Type": type, "Cache-Control": `public, max-age=${ONE_DAY_S}` } });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
