import type { Metadata } from "next";
import CheckoutPage from "@/views/checkout/page";
import { getLocale } from "@/i18n/server";
import { translate } from "@/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: translate(locale, "checkout.metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <CheckoutPage />;
}
