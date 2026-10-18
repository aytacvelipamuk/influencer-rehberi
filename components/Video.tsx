"use client";
import { useEffect, useRef } from "react";

/**
 * Sessiz, döngülü video. Görünümdeyken oynar, dışındayken durur (pil + bant).
 * 18 Eki: "hareketi azalt" açık Mac'te videolar hiç başlamıyordu, kullanıcı videoyu göremedi — sessiz ürün
 * videoları her durumda oynar; azaltılan şey sayfa hareketleridir.
 */
export function LoopVideo({ src, poster, className, label }: { src: string; poster?: string; className?: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={ref} className={className} poster={poster} muted loop playsInline preload="metadata" aria-label={label}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
