"use client";
// Giriş: tam ekran video, kaydırdıkça pembe zeminde ortada karta küçülür.
// İlerleme `--p` (0-1) değişkenine yazılır, geri kalanı CSS hesaplar (globals.css `.hero-scroll`).
import { useEffect, useRef, type ReactNode } from "react";

const HERO_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO || "/video/hero.mp4";
const HERO_POSTER = process.env.NEXT_PUBLIC_HERO_POSTER || "/video/hero.jpg";

export function HeroScroll({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = el.offsetHeight - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const listen = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", listen, { passive: true });
    window.addEventListener("resize", listen);
    return () => {
      window.removeEventListener("scroll", listen);
      window.removeEventListener("resize", listen);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero-scroll" ref={root}>
      <div className="hero-sticky">
        <p className="hero-side left" aria-hidden="true">Doğru</p>
        <p className="hero-side right" aria-hidden="true">influencer</p>
        <div className="hero-media">
          {/* Varsayılan: projeyle gelen yapay zekâ klibi (Seedance, logo/yazı yok). Kendi videonuz: NEXT_PUBLIC_HERO_VIDEO */}
          <video src={HERO_VIDEO} poster={HERO_POSTER} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        </div>
        <div className="hero-text">{children}</div>
      </div>
    </section>
  );
}
