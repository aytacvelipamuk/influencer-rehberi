import { cleanNote, cleanUtm, parseEmail, parseStoreUrl } from "@/lib/requests";
import { allowed, clientIp, saveRequest } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ success: false, error: "Form okunamadı." }, { status: 400 });
  if (body.website) return Response.json({ success: true }); // bal tuzağı: botlara başarılı görün
  const store = parseStoreUrl(body.store);
  const email = parseEmail(body.email);
  if (!store.ok) return Response.json({ success: false, error: store.error, field: "store" }, { status: 400 });
  if (!email.ok) return Response.json({ success: false, error: email.error, field: "email" }, { status: 400 });
  if (body.kvkk !== true) return Response.json({ success: false, error: "Aydınlatma metnini onayla.", field: "kvkk" }, { status: 400 });
  if (!allowed(clientIp(req))) return Response.json({ success: false, error: "Çok fazla deneme. Bir saat sonra tekrar dene." }, { status: 429 });
  try {
    await saveRequest("eslestir", {
      store_url: store.value.url,
      merchant_id: store.value.merchantId,
      email: email.value,
      marketing_consent: body.marketing === true,
      note: cleanNote(body.note),
      ...cleanUtm(body),
    });
  } catch (error) {
    console.error("[eslestir] talep yazılamadı", error);
    return Response.json({ success: false, error: "Talebin kaydedilemedi, lütfen tekrar dene." }, { status: 500 });
  }
  return Response.json({ success: true });
}
