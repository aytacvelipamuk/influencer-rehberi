// Siteyi işleten kişi/kurum: çatallayan herkes kendi bilgisini .env ile verir (bkz. .env.example).
// Boş bırakılan alan sayfada gösterilmez.
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Influencer Rehberi",
  operatorName: process.env.NEXT_PUBLIC_OPERATOR_NAME || "",
  operatorUrl: process.env.NEXT_PUBLIC_OPERATOR_URL || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  /** Rapor sonundaki "görüşme planla" düğmesi; boşsa düğme çıkmaz. */
  ctaUrl: process.env.NEXT_PUBLIC_CTA_URL || "",
  /** Kaynak kodun adresi (altbilgide). */
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/aytacvelipamuk/influencer-rehberi",
};
