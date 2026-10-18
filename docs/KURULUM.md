# Kurulum

## Yerel

```bash
npm install
npm run dev          # örnek veriyle
npm test             # vitest
npm run typecheck
npm run build && npm start
```

## Docker

```bash
docker build -t influencer-rehberi .
docker run -p 3000:3000 -v rehber-veri:/data -e REHBER_YAYIN_TOKEN=uzun-rastgele-jeton influencer-rehberi
```

İmajda veri yoktur; `/data/rehber` (veri) ve `/data/talepler` kalıcı birimde durur. Coolify'da: Dockerfile build pack,
port 3000, kalıcı disk `/data`, bellek sınırı 512 MB yeterli.

## Ortam değişkenleri

`.env.example` dosyasına bakın. `NEXT_PUBLIC_*` değişkenleri derleme anında okunur — değiştirince yeniden derleyin.

## Yayın ucu

Toplayıcı başka makinede çalışıyorsa veriyi jetonla yükleyin (`Authorization: Bearer $REHBER_YAYIN_TOKEN`).
Jeton tanımlı değilse uçlar kapalıdır (503).

| Uç | Yöntem | Gövde |
|---|---|---|
| `/api/yayin/dokum` | PUT | `influencers.json` içeriği (count = influencers.length) |
| `/api/yayin/avatars?platform=instagram` | GET | sunucudaki fotoğraf adları |
| `/api/yayin/avatars/instagram/<dosya>.jpg` | PUT | görsel baytları (≤1 MB) |
| `/api/yayin/medya/posts` · `/api/yayin/medya/highlights` | GET | sunucudaki dosya adları |
| `/api/yayin/medya/<posts\|highlights>/<id>.jpg` | PUT | görsel baytları |
| `/api/yayin/rapor/<jeton>` | PUT | rapor JSON'u |
| `/api/yayin/talepler?tur=eslestir\|kaldir` | GET | form talepleri (JSONL) |

Önce eksik görselleri, sonra dökümü yükleyin; site dökümü atomik yazar (yarım dosya okunmaz).

## Cloudflare notu

Cloudflare vekili arkasındaysa varsayılan "Python-urllib" gibi istemci kimlikleri engellenebilir; yükleyicinizde anlamlı
bir `User-Agent` gönderin.
