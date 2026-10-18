import { cleanNote, parseEmail, parseHandle } from "@/lib/requests";
import { allowed, clientIp, saveRequest } from "@/lib/store";

const ACTIONS = ["kaldir", "duzelt"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ success: false, error: "Form okunamadı." }, { status: 400 });
  if (body.website) return Response.json({ success: true });
  const handle = parseHandle(body.handle);
  const email = parseEmail(body.email);
  if (!handle.ok) return Response.json({ success: false, error: handle.error, field: "handle" }, { status: 400 });
  if (!email.ok) return Response.json({ success: false, error: email.error, field: "email" }, { status: 400 });
  const action = ACTIONS.includes(body.action) ? body.action : "kaldir";
  if (!allowed(clientIp(req))) return Response.json({ success: false, error: "Çok fazla deneme. Bir saat sonra tekrar dene." }, { status: 429 });
  try {
    await saveRequest("kaldir", { handle: handle.value, email: email.value, action, note: cleanNote(body.note) });
  } catch (error) {
    console.error("[kaldir] talep yazılamadı", error);
    return Response.json({ success: false, error: "Talebin kaydedilemedi, lütfen tekrar dene." }, { status: 500 });
  }
  return Response.json({ success: true });
}
