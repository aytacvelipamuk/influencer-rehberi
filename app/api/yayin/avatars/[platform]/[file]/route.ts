import { authorize, AVATAR_FILE_RE, MAX_AVATAR_BYTES, PLATFORM_RE, writeAvatar } from "@/lib/publish";

export async function PUT(req: Request, ctx: RouteContext<"/api/yayin/avatars/[platform]/[file]">) {
  const denied = authorize(req);
  if (denied) return denied;
  const { platform, file } = await ctx.params;
  if (!PLATFORM_RE.test(platform) || !AVATAR_FILE_RE.test(file)) {
    return Response.json({ success: false, error: "gecersiz_ad" }, { status: 400 });
  }
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_AVATAR_BYTES) return Response.json({ success: false, error: "gecersiz_boyut" }, { status: 400 });
  try {
    await writeAvatar(platform, file, bytes);
  } catch (error) {
    console.error("[yayin] fotoğraf yazılamadı", file, error);
    return Response.json({ success: false, error: "yazilamadi" }, { status: 500 });
  }
  return Response.json({ success: true });
}
