import { authorize, isMediaKind, MAX_AVATAR_BYTES, MEDIA_FILE_RE, writeMedia } from "@/lib/publish";

export async function PUT(req: Request, ctx: RouteContext<"/api/yayin/medya/[kind]/[file]">) {
  const denied = authorize(req);
  if (denied) return denied;
  const { kind, file } = await ctx.params;
  if (!isMediaKind(kind) || !MEDIA_FILE_RE.test(file)) return Response.json({ success: false, error: "gecersiz_ad" }, { status: 400 });
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_AVATAR_BYTES) return Response.json({ success: false, error: "gecersiz_boyut" }, { status: 400 });
  try {
    await writeMedia(kind, file, bytes);
  } catch (error) {
    console.error("[yayin] medya yazılamadı", kind, file, error);
    return Response.json({ success: false, error: "yazilamadi" }, { status: 500 });
  }
  return Response.json({ success: true });
}
