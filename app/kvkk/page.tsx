import { SITE } from "@/lib/site";
import type { Metadata } from"next";

export const metadata: Metadata = { title:"KVKK aydınlatma metni" };

// TASLAK: hukukçu kontrolünden geçmeden yayına alınmayacak (docs/INFLUENCER-REHBERI-PLANI.md §4.3).
export default function KvkkPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-4 pt-16 text-ink-2 md:pt-24 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-ink">
      <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none text-ink">KVKK aydınlatma metni</h1>
      <p className="rounded-xl border border-pink-soft bg-blush px-4 py-3 text-sm text-pink">Taslak metin — yayın öncesi hukuki kontrol bekliyor.</p>
      <h2>Veri sorumlusu</h2>
      <p>{SITE.operatorName || "Bu siteyi işleten kişi/kurum"}{SITE.operatorUrl && ` (${SITE.operatorUrl})`}.</p>
      <h2>Rehberdeki influencer verileri</h2>
      <p>
        Rehberde yer alan bilgiler (hesap adı, görünen ad, profil fotoğrafı, takipçi sayısı, bio, gönderi etkileşimleri ve
        Trendyol koleksiyonundaki markalar) ilgili kişilerin herkese açık yaptığı profillerden derlenir. E-posta, telefon gibi
        iletişim bilgileri yayınlanmaz. Amaç, satıcıların uygun iş birliği ortağını bulmasını kolaylaştırmaktır (KVKK m.5/2-d:
        ilgili kişinin kendisi tarafından alenileştirilmiş veri; m.5/2-f: meşru menfaat).
      </p>
      <p>Hesabının rehberden kaldırılmasını ya da düzeltilmesini <a href="/kaldir" className="text-pink underline">bu formdan</a> isteyebilirsin.</p>
      <h2>Eşleşme raporu formu</h2>
      <p>
        Formda verdiğin mağaza linki ve e-posta adresi, raporu hazırlamak ve sana göndermek için işlenir. Pazarlama e-postası
        yalnızca ayrıca onay verirsen gönderilir; onayını her e-postadaki bağlantıyla geri alabilirsin.
      </p>
      <h2>Haklarınız</h2>
      {SITE.contactEmail && <p>KVKK m.11 kapsamındaki haklarını kullanmak için {SITE.contactEmail} adresine yazabilirsin.</p>}
    </article>
  );
}
