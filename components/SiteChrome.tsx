import Link from "next/link";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="font-serif text-2xl leading-none whitespace-nowrap">
          Influencer Rehberi
        </Link>
        <nav className="flex items-center gap-5 text-[0.95rem] text-ink-2 md:gap-8">
          <Link href="/rehber" className="underline-grow hover:text-ink">Rehber</Link>
          <Link href="/#nasil" className="underline-grow hidden hover:text-ink md:inline">Nasıl kullanılır</Link>
          <Link href="/eslestir" className="rounded-full bg-pink px-4 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-pink-dark">
            <span className="sm:hidden">Eşleştir</span>
            <span className="hidden sm:inline">Mağazama uygun olanlar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ generatedAt }: { generatedAt: string }) {
  const date = generatedAt ? new Date(generatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "—";
  return (
    <footer className="mt-28 bg-blush">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-[0.95rem] text-ink-2 md:grid-cols-[2fr_1fr_1fr] md:px-8">
        <div className="max-w-md space-y-3">
          <p className="font-serif text-3xl text-ink">Influencer Rehberi</p>
          <p>Trendyol satıcılarının doğru içerik üreticisini bulması için ücretsiz rehber. {SITE.operatorName && ` ${SITE.operatorName} tarafından işletilir.`}</p>
          <p className="text-sm text-faint">Herkese açık profillerden derlenir. Son güncelleme: {date}.</p>
        </div>
        <ul className="space-y-2">
          <li><Link href="/rehber" className="underline-grow hover:text-ink">Rehber</Link></li>
          <li><Link href="/eslestir" className="underline-grow hover:text-ink">Eşleşme raporu</Link></li>
          <li><Link href="/nasil-olcuyoruz" className="underline-grow hover:text-ink">Nasıl ölçüyoruz</Link></li>
          {SITE.operatorUrl && <li><a href={SITE.operatorUrl} className="underline-grow hover:text-ink">{SITE.operatorUrl.replace(/^https?:\/\//, "")}</a></li>}
          <li><a href={SITE.repoUrl} className="underline-grow hover:text-ink">Açık kaynak (MIT)</a></li>
        </ul>
        <ul className="space-y-2">
          <li><Link href="/kaldir" className="underline-grow hover:text-ink">Profilimi kaldır / düzelt</Link></li>
          <li><Link href="/kvkk" className="underline-grow hover:text-ink">KVKK aydınlatma metni</Link></li>
          <li className="pt-2 text-sm text-faint">Trendyol ile bağlantılı değildir; Trendyol&apos;un resmî aracı değildir.</li>
        </ul>
      </div>
    </footer>
  );
}
