import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Footer, Header } from "@/components/SiteChrome";
import { loadSnapshot } from "@/lib/data";
import "./globals.css";

// god-typography "Editorial modern": Instrument Serif başlık + Instrument Sans metin, ikisi de latin-ext (Türkçe).
const serif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"] });
const sans = Instrument_Sans({ variable: "--font-instrument-sans", subsets: ["latin", "latin-ext"] });

// Veri çalışma anında kalıcı diskten okunur; derleme anında (Docker) veri yok → hiçbir sayfa statik dondurulmamalı.
// 18 Eki: ana sayfa derlemede "0 influencer" ile donmuştu.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Influencer Rehberi · Trendyol satıcıları için ücretsiz", template: "%s · Influencer Rehberi" },
  description:
    "Trendyol'daki influencer'ları koleksiyonları, çalıştıkları markalar, kategorileri ve etkileşimleriyle ücretsiz arayın. Mağaza linkinizi verin, size uygun olanları e-postanıza gönderelim.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { generated_at } = await loadSnapshot();
  return (
    <html lang="tr" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Belirme efekti yalnız JS çalışıyorsa içeriği gizler; JS'siz ziyaretçi ve arama motoru her şeyi görür. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer generatedAt={generated_at} />
      </body>
    </html>
  );
}
