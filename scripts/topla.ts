/**
 * Toplayıcı: hesap listesi → Bright Data → data/influencers.json (+ görseller). Site bu dosyayı okur.
 *
 *   npm run topla                       # hesaplar.csv'deki hesaplar
 *   npm run topla -- --kuru             # yalnız maliyet tahmini, para harcamaz
 *   npm run topla -- --onay             # bütçe uyarı sınırını aşsa da çalış
 *   npm run topla -- --devam            # yarıda kalan işleri al (yeniden ödeme yok)
 *   npm run topla -- --gonderi 12 --reels 6 --hesaplar ayse,mehmet
 *
 * Gerekli: .env içinde BRIGHTDATA_API_KEY. Ham yanıtlar data/ham/ altına yazılır.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { BrightData, PRICE_PER_RECORD_USD, type Row } from "./topla/brightdata";
import { type Account, addPost, addProfile, addReel, toInfluencer } from "./topla/build";
import { downloadAll } from "./topla/media";
import { SEGMENT_NAMES } from "./topla/segments";
import { TIERS } from "../lib/scoring/engagement";

const DATA = path.resolve(process.env.REHBER_DATA_DIR ?? "data");
const HAM = path.join(DATA, "ham");
const BATCH = 50;
const BUDGET_WARN_USD = Number(process.env.TOPLA_BUTCE_UYARI_USD ?? 5);
const HANDLE_RE = /^[a-z0-9._]{1,30}$/;

interface Job { kind: "profiles" | "posts" | "reels"; snapshot: string; handles: string[]; done: boolean }
type Kind = Job["kind"];

const log = (m: string) => console.log(m);
const readJson = <T>(file: string, fallback: T): T => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
const writeJson = (file: string, data: unknown) => { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data)); };

/** hesaplar.csv: hesap[,kategori1;kategori2][,marka1;marka2] — # ile başlayan satır yorum. */
function readAccounts(file: string, inline?: string) {
  // --devam hesap listesi istemez: dosya yoksa boş liste (yarıda kalan işler isler.json'dan gelir).
  const lines = inline ? inline.split(",") : existsSync(file) ? readFileSync(file, "utf8").split(/\r?\n/) : [];
  const extra = new Map<string, { segments: string[]; brands: string[] }>();
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const [h, seg = "", br = ""] = inline ? [line] : line.split(",");
    const handle = h.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").toLowerCase();
    if (!HANDLE_RE.test(handle)) { log(`  atlandı (geçersiz hesap adı): ${h}`); continue; }
    extra.set(handle, { segments: seg.split(";").map((s) => s.trim()).filter((s) => s in SEGMENT_NAMES), brands: br.split(";").map((s) => s.trim()).filter(Boolean) });
  }
  return extra;
}

async function main() {
  const { values } = parseArgs({ options: {
    hesaplar: { type: "string" }, dosya: { type: "string", default: "hesaplar.csv" },
    gonderi: { type: "string", default: "12" }, reels: { type: "string", default: "6" },
    kuru: { type: "boolean", default: false }, onay: { type: "boolean", default: false }, devam: { type: "boolean", default: false },
  } });
  try { process.loadEnvFile(); } catch { /* .env yoksa ortam değişkenleri kullanılır */ }
  const key = process.env.BRIGHTDATA_API_KEY;
  const jobsFile = path.join(HAM, "isler.json");
  const jobs: Job[] = readJson(jobsFile, []);
  const accounts = readAccounts(values.dosya!, values.hesaplar);
  const handles = [...accounts.keys()];
  const perPosts = Number(values.gonderi), perReels = Number(values.reels);

  if (!values.devam) {
    const records = handles.length * (1 + perPosts + perReels);
    const cost = records * PRICE_PER_RECORD_USD;
    log(`${handles.length} hesap · ~${records} kayıt · tahmini maliyet ~$${cost.toFixed(2)} (kayıt başı $${PRICE_PER_RECORD_USD})`);
    if (values.kuru) return;
    if (!handles.length) { log("Hesap yok: hesaplar.csv'ye hesap adı yaz ya da --hesaplar kullan."); return; }
    if (cost > BUDGET_WARN_USD && !values.onay) { log(`Bütçe uyarı sınırı $${BUDGET_WARN_USD} aşılıyor. Onaylıyorsan --onay ekle.`); return; }
  }
  if (!key) throw new Error("BRIGHTDATA_API_KEY yok: .env.example'ı .env olarak kopyala ve anahtarını yaz.");
  const bd = new BrightData(key);

  if (!values.devam) {
    for (let i = 0; i < handles.length; i += BATCH) {
      const part = handles.slice(i, i + BATCH);
      const kinds: [Kind, number | undefined][] = [["profiles", undefined], ["posts", perPosts], ["reels", perReels]];
      for (const [kind, per] of kinds) {
        if (kind !== "profiles" && !per) continue;
        jobs.push({ kind, snapshot: await bd.trigger(kind, part, per), handles: part, done: false });
        writeJson(jobsFile, jobs); // iş kimliği hemen diske: çökse bile --devam alır
      }
      log(`  parti ${i / BATCH + 1}: ${part.length} hesap için işler açıldı`);
    }
  }

  for (const job of jobs.filter((j) => !j.done)) {
    log(`  bekleniyor: ${job.kind} ${job.snapshot}`);
    writeJson(path.join(HAM, `${job.snapshot}.json`), await bd.results(job.snapshot, log));
    job.done = true;
    writeJson(jobsFile, jobs);
  }

  const acc = new Map<string, Account>();
  const add = { profiles: addProfile, posts: addPost, reels: addReel };
  for (const job of jobs) for (const r of readJson<Row[]>(path.join(HAM, `${job.snapshot}.json`), [])) add[job.kind](acc, r);

  log(`  görseller indiriliyor (${acc.size} hesap)`);
  const media = await downloadAll(DATA, [...acc.values()]);
  const historyFile = path.join(DATA, "gecmis.json");
  const history: Record<string, number[]> = readJson(historyFile, {});
  const previous = readJson<{ influencers: ReturnType<typeof toInfluencer>[] }>(path.join(DATA, "influencers.json"), { influencers: [] });
  const merged = new Map(previous.influencers.map((r) => [r.handle, r]));
  for (const a of acc.values()) {
    if (!a.profile) continue;
    const x = accounts.get(a.handle);
    const rec = toInfluencer(a, { ...x, history: history[a.handle], ...media.get(a.handle) });
    if (rec.followers) history[a.handle] = [...(history[a.handle] ?? []), rec.followers].slice(-12);
    merged.set(a.handle, { ...rec, first_seen_at: merged.get(a.handle)?.first_seen_at ?? rec.first_seen_at });
  }
  const influencers = [...merged.values()].sort((m, n) => (n.followers ?? 0) - (m.followers ?? 0));
  writeJson(historyFile, history);
  writeJson(path.join(DATA, "influencers.json"), {
    generated_at: new Date().toISOString(), count: influencers.length,
    labels: { segments: SEGMENT_NAMES, tiers: TIERS.map(([k, from, to]) => ({ key: k, from, to })) }, influencers,
  });
  writeJson(jobsFile, []); // tamamlanan işler temizlenir; ham yanıtlar data/ham'da kalır
  log(`Tamam: ${influencers.length} hesap → ${path.join(DATA, "influencers.json")}`);
}

main().catch((e) => { console.error(`Hata: ${e instanceof Error ? e.message : e}`); process.exit(1); });
