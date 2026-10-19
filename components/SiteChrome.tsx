import Link from "next/link";
import { metin } from "@/lib/metinler";
import { SITE } from "@/lib/site";

const H = metin.header;
const F = metin.footer;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="font-serif text-2xl leading-none whitespace-nowrap">
          {metin.site.name}
        </Link>
        <nav className="flex items-center gap-5 text-[0.95rem] text-ink-2 md:gap-8">
          <Link href="/rehber" className="underline-grow hover:text-ink">{H.directory}</Link>
          <Link href="/#nasil" className="underline-grow hidden hover:text-ink md:inline">{H.howTo}</Link>
          <Link href="/eslestir" className="rounded-full bg-pink px-4 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-pink-dark">
            <span className="sm:hidden">{H.matchShort}</span>
            <span className="hidden sm:inline">{H.matchLong}</span>
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
          <p className="font-serif text-3xl text-ink">{metin.site.name}</p>
          <p>{F.about} {SITE.operatorName && F.operatedBy(SITE.operatorName)}</p>
          <p className="text-sm text-faint">{F.updated(date)}</p>
        </div>
        <ul className="space-y-2">
          <li><Link href="/rehber" className="underline-grow hover:text-ink">{F.directory}</Link></li>
          <li><Link href="/eslestir" className="underline-grow hover:text-ink">{F.matchReport}</Link></li>
          <li><Link href="/nasil-olcuyoruz" className="underline-grow hover:text-ink">{F.method}</Link></li>
          {SITE.operatorUrl && <li><a href={SITE.operatorUrl} className="underline-grow hover:text-ink">{SITE.operatorUrl.replace(/^https?:\/\//, "")}</a></li>}
          <li><a href={SITE.repoUrl} className="underline-grow hover:text-ink">{F.openSource}</a></li>
        </ul>
        <ul className="space-y-2">
          <li><Link href="/kaldir" className="underline-grow hover:text-ink">{F.removal}</Link></li>
          <li><Link href="/kvkk" className="underline-grow hover:text-ink">{F.privacy}</Link></li>
          <li className="pt-2 text-sm text-faint">{F.notAffiliated}</li>
        </ul>
      </div>
    </footer>
  );
}
