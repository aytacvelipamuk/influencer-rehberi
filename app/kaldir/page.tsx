import type { Metadata } from"next";
import { RequestForm } from"@/components/RequestForm";

export const metadata: Metadata = { title:"Profilimi kaldır / düzelt" };

export default function RemovalPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 md:pt-24">
      <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none">Profilimi kaldır ya da düzelt</h1>
      <p className="mt-4 text-ink-2">
        Rehberdeki bilgiler herkese açık profillerden derlenir. Hesabının rehberde görünmesini istemiyorsan ya da bir bilgi
        yanlışsa bize yaz; talebi 48 saat içinde işleriz. Kaldırılan hesap bir daha yayınlanmaz.
      </p>
      <div className="mt-10 rounded-xl border border-line bg-paper p-6 md:p-8">
        <RequestForm
          endpoint="/api/kaldir"
          submitLabel="Talebi gönder"
          fields={[
            { name:"handle", label:"Hesap adın", placeholder:"@hesapadin", required: true },
            { name:"action", label:"Ne yapalım?", type:"select", options: [["kaldir","Profilimi kaldırın"], ["duzelt","Bir bilgiyi düzeltin"]] },
            { name:"email", label:"E-posta adresin (sonucu bildirmek için)", type:"email", required: true },
            { name:"note", label:"Açıklama", type:"textarea", placeholder:"Düzeltme istiyorsan neyin yanlış olduğunu yaz." },
          ]}
          success={{ title:"Talebin alındı", body:"48 saat içinde işleyip e-postanla bilgi vereceğiz." }}
        />
      </div>
    </div>
  );
}
