import { authorize, isMediaKind, listMedia } from "@/lib/publish";

/** Sunucudaki medya dosyaları (posts | highlights); veri hattı yalnız eksikleri yükler. */
export async function GET(req: Request, ctx: RouteContext<"/api/yayin/medya/[kind]">) {
  const denied = authorize(req);
  if (denied) return denied;
  const { kind } = await ctx.params;
  if (!isMediaKind(kind)) return Response.json({ success: false, error: "gecersiz_tur" }, { status: 400 });
  return Response.json({ success: true, data: await listMedia(kind) });
}
