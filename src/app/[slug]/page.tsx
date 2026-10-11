import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import AnnouncementBar from "@/components/feature/AnnouncementBar";
import { payloadGet } from "@/lib/payload";
import type { Store } from "@/lib/payload";
import { getLocale } from "@/i18n/server";
import { translate } from "@/i18n/translate";

const pages: Record<string, { label: string; field?: string }> = {
  shipping: { label: "shipping", field: "shipping" },
  returns: { label: "returns", field: "returns" },
  "size-guide": { label: "sizeGuide", field: "sizeGuide" },
  about: { label: "about", field: "about" },
  stores: { label: "stores" },
  contact: { label: "contact" },
};

type Settings = {
  informationPages?: Record<string, string | null> | null;
  address?: string | null;
  hotline?: string | null;
  email?: string | null;
  workingHours?: string | null;
};
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = pages[slug];
  if (!config) return {};
  const locale = await getLocale();
  return { title: translate(locale, `footer.link.${config.label}`), alternates: { canonical: `/${slug}` } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const config = pages[slug];
  if (!config) notFound();
  const [locale, settings, storeData] = await Promise.all([
    getLocale(),
    payloadGet<Settings>("/globals/site-settings", 0),
    slug === "stores" ? payloadGet<{ docs: Store[] }>("/stores?limit=100&depth=0", 0) : null,
  ]);
  const title = translate(locale, `footer.link.${config.label}`);
  const content = config.field ? settings?.informationPages?.[config.field]?.trim() : null;
  const pending = locale === "vi" ? "Nội dung đang cập nhật." : "Content is being updated.";
  const contactRows = [
    { label: locale === "vi" ? "Địa chỉ" : "Address", value: settings?.address },
    { label: locale === "vi" ? "Điện thoại" : "Phone", value: settings?.hotline, href: `tel:${settings?.hotline?.replace(/[^+\d]/g, "")}` },
    { label: "Email", value: settings?.email, href: `mailto:${settings?.email}` },
    { label: locale === "vi" ? "Giờ làm việc" : "Working hours", value: settings?.workingHours },
  ].filter((row) => row.value?.trim());

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <AnnouncementBar />
      <SiteHeader />
      <main className="mx-auto w-full max-w-site flex-1 px-4 py-10 md:px-8 md:py-16">
        <h1 className="font-heading text-2xl font-extrabold text-foreground-950 md:text-3xl">{title}</h1>
        {config.field && <div className="mt-8 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-foreground-700">{content || pending}</div>}
        {slug === "contact" && (
          contactRows.length ? <dl className="mt-8 max-w-3xl divide-y divide-background-200">
            {contactRows.map((row) => <div key={row.label} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]">
              <dt className="text-sm font-bold">{row.label}</dt>
              <dd className="break-words text-sm text-foreground-700">{row.href ? <a className="underline underline-offset-4" href={row.href}>{row.value}</a> : row.value}</dd>
            </div>)}
          </dl> : <p className="mt-8 text-sm">{pending}</p>
        )}
        {slug === "stores" && (
          storeData?.docs.length ? <div className="mt-8 grid gap-8 md:grid-cols-2">
            {storeData.docs.map((store) => <article key={store.id} className="border-t border-background-300 pt-5">
              <h2 className="font-heading text-lg font-bold">{store.name}</h2>
              <p className="mt-3 text-sm leading-6">{store.address}</p>
              {store.hours && <p className="mt-2 text-sm">{store.hours}</p>}
              {store.phone && <a className="mt-2 block text-sm underline underline-offset-4" href={`tel:${store.phone.replace(/[^+\d]/g, "")}`}>{store.phone}</a>}
              {store.mapUrl && /^https?:\/\//i.test(store.mapUrl) && <a className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4" href={store.mapUrl} target="_blank" rel="noopener noreferrer"><i className="ri-map-pin-line" aria-hidden="true" />{locale === "vi" ? "Xem bản đồ" : "View map"}</a>}
            </article>)}
          </div> : <p className="mt-8 text-sm">{pending}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}