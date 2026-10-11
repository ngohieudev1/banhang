import { ADMIN_URL, payloadGet } from "@/lib/payload";
import type { Product, ProductSku } from "@/mocks/products";

type ApiMedia = { url?: string | null } | string | null;

type ApiSku = {
  id: string;
  code: string;
  name: string;
  priceInVND?: number | null;
  compareAtPrice?: number | null;
  inventory?: number | null;
  images?: { image: ApiMedia }[] | null;
  color?: { name?: string | null; hex?: string | null } | null;
  shortDescription?: string | null;
  highlights?: { text: string }[] | null;
  specs?: { label: string; value: string }[] | null;
  active?: boolean | null;
};

type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  priceInVND?: number | null;
  compareAtPrice?: number | null;
  tag?: string | null;
  hoverImageUrl?: string | null;
  colors?: { name: string; hex: string }[] | null;
  skus?: (ApiSku | string)[] | null;
  gallery?: { image: ApiMedia }[] | null;
  shortDescription?: string | null;
  highlights?: { text: string }[] | null;
  specs?: { label: string; value: string }[] | null;
  perks?: { shipping?: string | null; returns?: string | null; warranty?: string | null } | null;
  legalInfo?: { label: string; value: string }[] | null;
  rating?: number | null;
  reviewCount?: number | null;
};

type ApiList = { docs: ApiProduct[] };

export type ProductDetail = {
  docId: string;
  description?: string;
  highlights: string[];
  specs: [string, string][];
  rating: number;
  reviews: number;
  extraImages: string[];
  perks: { shipping?: string; returns?: string; warranty?: string };
  legal: [string, string][];
};

const mediaUrl = (media: ApiMedia | undefined): string => {
  if (!media || typeof media === "string" || !media.url) return "";
  return media.url.startsWith("http") ? media.url : `${ADMIN_URL}${media.url}`;
};

const toSku = (sku: ApiSku): ProductSku => {
  const images = (sku.images ?? []).map((item) => mediaUrl(item.image)).filter(Boolean);
  return {
    id: sku.id,
    code: sku.code,
    name: sku.name,
    price: sku.priceInVND ?? 0,
    compareAtPrice: sku.compareAtPrice ?? undefined,
    image: images[0] ?? "",
    images,
    color: sku.color?.name ? { name: sku.color.name, hex: sku.color.hex || "#cccccc" } : undefined,
    inventory: sku.inventory ?? 0,
    description: sku.shortDescription ?? undefined,
    highlights: (sku.highlights ?? []).map((item) => item.text),
    specs: (sku.specs ?? []).map((item): [string, string] => [item.label, item.value]),
  };
};

// Chỉ lấy SKU đã được populate và đang bán (API đã lọc theo quyền đọc).
const skusOf = (doc: ApiProduct): ProductSku[] =>
  (doc.skus ?? [])
    .filter((item): item is ApiSku => typeof item === "object" && item !== null && item.active !== false)
    .map(toSku);

const toProduct = (doc: ApiProduct): Product => {
  const skus = skusOf(doc);
  const first = skus[0];
  const image = first?.image || mediaUrl(doc.gallery?.[0]?.image);
  const skuColors = skus.flatMap((sku) => (sku.color ? [sku.color] : []));
  const colors = skuColors.length > 0 ? skuColors : (doc.colors ?? []).map(({ name, hex }) => ({ name, hex }));
  return {
    id: doc.slug,
    name: doc.title,
    price: first ? first.price : (doc.priceInVND ?? 0),
    compareAtPrice: first ? first.compareAtPrice : (doc.compareAtPrice ?? undefined),
    image,
    hoverImage:
      (first ? first.images[1] : "") || doc.hoverImageUrl || mediaUrl(doc.gallery?.[1]?.image) || image,
    colors,
    tag: doc.tag ?? undefined,
    skus: skus.length > 0 ? skus : undefined,
  };
};

const toDetail = (doc: ApiProduct): ProductDetail => ({
  docId: doc.id,
  description: doc.shortDescription ?? undefined,
  highlights: (doc.highlights ?? []).map((item) => item.text),
  specs: (doc.specs ?? []).map((item): [string, string] => [item.label, item.value]),
  rating: doc.rating ?? 0,
  reviews: doc.reviewCount ?? 0,
  perks: {
    shipping: doc.perks?.shipping?.trim() || undefined,
    returns: doc.perks?.returns?.trim() || undefined,
    warranty: doc.perks?.warranty?.trim() || undefined,
  },
  legal: (doc.legalInfo ?? []).map((item): [string, string] => [item.label, item.value]),
  extraImages: (doc.gallery ?? [])
    .slice(1)
    .map((item) => mediaUrl(item.image))
    .filter(Boolean),
});

export async function getProducts(): Promise<Product[]> {
  const data = await payloadGet<ApiList>(
    "/products?limit=200&depth=2&sort=createdAt&where[_status][equals]=published",
    60,
  );
  return (data?.docs ?? []).map(toProduct);
}

export async function getProduct(
  slug: string,
): Promise<{ product: Product; detail: ProductDetail } | null> {
  const data = await payloadGet<ApiList>(
    `/products?limit=1&depth=2&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`,
    60,
  );
  const doc = data?.docs?.[0];
  return doc ? { product: toProduct(doc), detail: toDetail(doc) } : null;
}

export function pickRelatedProducts(product: Product, all: Product[]): Product[] {
  const others = all.filter((item) => item.id !== product.id);
  const sameColors = others.filter((item) =>
    item.colors.some((color) => product.colors.some((current) => current.name === color.name)),
  );
  const pool = sameColors.length >= 4 ? sameColors : [...sameColors, ...others];
  const seen = new Set<string>();
  const unique: Product[] = [];
  pool.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  });
  return unique.slice(0, 4);
}
