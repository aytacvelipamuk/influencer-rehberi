"use client";
// Motion Prompt #090 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#090
// Lazy loading: görünene kadar yer tutucu, yüklenince 0,3 sn'de belirir.
import { useState } from "react";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: number;
  /** Kabın tamamını doldur (yüz duvarı); verilmezse `size` piksel. */
  fill?: boolean;
}

export function Avatar({ src, name, size = 56, fill = false }: AvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const initials = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toLocaleUpperCase("tr");
  const box = fill ? { width: "100%", height: "100%", fontSize: "clamp(0.8rem, 2vw, 1.4rem)" } : { width: size, height: size, fontSize: size * 0.36 };
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush-2 font-serif text-pink" style={box}>
      {initials || "?"}
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element -- fotoğraf kendi rotamızdan, 150 px kaynak
        <img
          // Önbellekten gelen resim React bağlanmadan yüklenebilir; onLoad kaçarsa `complete` ile yakala.
          ref={(img) => {
            if (img?.complete && img.naturalWidth) setLoaded(true);
          }}
          src={`/${src}`}
          alt=""
          width={fill ? 150 : size}
          height={fill ? 150 : size}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
    </span>
  );
}
