import { authorize, validSnapshot, writeSnapshot } from "@/lib/publish";

export async function PUT(req: Request) {
  const denied = authorize(req);
  if (denied) return denied;
  const text = await req.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ success: false, error: "gecersiz_json" }, { status: 400 });
  }
  if (!validSnapshot(body)) return Response.json({ success: false, error: "gecersiz_dokum" }, { status: 400 });
  try {
    await writeSnapshot(text);
  } catch (error) {
    console.error("[yayin] döküm yazılamadı", error);
    return Response.json({ success: false, error: "yazilamadi" }, { status: 500 });
  }
  return Response.json({ success: true, data: { count: body.count } });
}
