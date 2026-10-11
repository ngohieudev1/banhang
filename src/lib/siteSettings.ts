import { payloadGet } from "@/lib/payload";
import { collectionMeta } from "@/mocks/products";
import { legalRows } from "@/mocks/productDetails";
import { SITE_NAME } from "@/lib/site";

type ApiSiteSettings = {
  brandName?: string | null;
  announcements?: { text?: string | null }[] | null;
  legalInfo?: { label: string; value: string }[] | null;
  collectionPage?: {
    title?: string | null;
    subtitle?: string | null;
    breadcrumb?: string | null;
  } | null;
  productPerks?: {
    shipping?: string | null;
    returns?: string | null;
    warranty?: string | null;
  } | null;
};

export async function getBrandName(): Promise<string> {
  const data = await payloadGet<ApiSiteSettings>("/globals/site-settings", 0);
  return data?.brandName?.trim() || SITE_NAME;
}

export async function getAnnouncements(): Promise<string[]> {
  const data = await payloadGet<ApiSiteSettings>("/globals/site-settings", 0);
  return (data?.announcements ?? []).map((item) => item.text?.trim() ?? "").filter(Boolean);
}

export async function getLegalRows(): Promise<[string, string][]> {
  const data = await payloadGet<ApiSiteSettings>("/globals/site-settings");
  const rows = (data?.legalInfo ?? []).map((item): [string, string] => [item.label, item.value]);
  return rows.length > 0 ? rows : legalRows;
}

export async function getCollectionMeta(): Promise<{
  title: string;
  subtitle: string;
  breadcrumb: string;
}> {
  const data = await payloadGet<ApiSiteSettings>("/globals/site-settings");
  return {
    title: data?.collectionPage?.title || collectionMeta.title,
    subtitle: data?.collectionPage?.subtitle || collectionMeta.subtitle,
    breadcrumb: data?.collectionPage?.breadcrumb || collectionMeta.breadcrumb,
  };
}

export async function getProductPerks(): Promise<{
  shipping: string;
  returns: string;
  warranty: string;
}> {
  const data = await payloadGet<ApiSiteSettings>("/globals/site-settings");
  return {
    shipping: data?.productPerks?.shipping || "Free HCM shipping over 450K",
    returns: data?.productPerks?.returns || "7-day free returns",
    warranty: data?.productPerks?.warranty || "12-month warranty",
  };
}
