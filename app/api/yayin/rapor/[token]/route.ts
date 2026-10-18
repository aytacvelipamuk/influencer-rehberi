import { authorize, REPORT_TOKEN_RE, validReport, writeReport } from "@/lib/publish";

export async function PUT(req: Request, ctx: RouteContext<"/api/yayin/rapor/[token]">) {
  const denied = authorize(req);
  if (denied) return denied;
  const { token } = await ctx.params;
  if (!REPORT_TOKEN_RE.test(token)) return Response.json({ success: false, error: "gecersiz_jeton" }, { status: 400 });
  const text = await req.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ success: false, error: "gecersiz_json" }, { status: 400 });
  }
  if (!validReport(body) || (body as { token: string }).token !== token) {
    return Response.json({ success: false, error: "gecersiz_rapor" }, { status: 400 });
  }
  try {
    await writeReport(token, text);
  } catch (error) {
    console.error("[yayin] rapor yazılamadı", token, error);
    return Response.json({ success: false, error: "yazilamadi" }, { status: 500 });
  }
  return Response.json({ success: true });
}
