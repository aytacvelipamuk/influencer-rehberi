import { authorize, listAvatars, PLATFORM_RE } from "@/lib/publish";

/** Sunucuda olan fotoğraflar; veri hattı yalnız eksikleri yükler. */
export async function GET(req: Request) {
  const denied = authorize(req);
  if (denied) return denied;
  const platform = new URL(req.url).searchParams.get("platform") ?? "instagram";
  if (!PLATFORM_RE.test(platform)) return Response.json({ success: false, error: "gecersiz_platform" }, { status: 400 });
  return Response.json({ success: true, data: await listAvatars(platform) });
}
