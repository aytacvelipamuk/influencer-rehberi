"use client";
// Motion Prompt #074 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#074
// Fade-in on scroll: tetik çizgisi görünümün %85'i; 0,7 sn'de opaklık 0→1 ve 28 px aşağıdan yerine (cubic ease-out).
// Görünümün altından çıkınca sıfırlanır, tekrar gelince yeniden oynar.
// İçerik JS'siz de görünür: gizleme yalnız <html class="js"> varken uygulanır (globals.css `[data-reveal]`).
import { useEffect, useRef, type ReactNode } from "react";

const TRIGGER_MARGIN = "0px 0px -15% 0px";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.shown = "";
        else if (entry.boundingClientRect.top > 0) delete el.dataset.shown; // yalnız alttan çıkınca sıfırla
      },
      { rootMargin: TRIGGER_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={className} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
