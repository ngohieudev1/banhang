import type { Metadata } from "next";
import CollectionPage from "@/views/collection/page";
import { getProducts } from "@/lib/products";
import { getCollectionMeta } from "@/lib/siteSettings";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Page() {
  const [products, meta] = await Promise.all([getProducts(), getCollectionMeta()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bags",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${product.id}`,
      name: product.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <CollectionPage products={products} meta={meta} />
    </>
  );
}
