import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailPage from "@/views/product/page";
import { getProduct, getProducts, pickRelatedProducts } from "@/lib/products";
import { getBrandName, getLegalRows, getProductPerks } from "@/lib/siteSettings";
import { getReviews } from "@/lib/reviews";
import { SITE_URL } from "@/lib/site";
import { getLocale } from "@/i18n/server";
import { translate } from "@/i18n/translate";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [data, locale, brandName] = await Promise.all([getProduct(id), getLocale(), getBrandName()]);
  if (!data) return {};
  const { product, detail } = data;

  const description = detail.description ?? translate(locale, "product.defaultStory", { brandName });

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: "website",
      title: `${product.name} – ${brandName}`,
      description,
      images: [{ url: product.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} – ${brandName}`,
      description,
      images: [product.image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [data, all, legal, perks, brandName] = await Promise.all([getProduct(id), getProducts(), getLegalRows(), getProductPerks(), getBrandName()]);
  if (!data) notFound();
  const { product, detail } = data;
  const related = pickRelatedProducts(product, all);
  const reviews = await getReviews(detail.docId);
  const ratingValue = reviews.count > 0 ? reviews.average : detail.rating;
  const ratingCount = reviews.count > 0 ? reviews.count : detail.reviews;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image, product.hoverImage].filter(Boolean),
    description: detail.description,
    brand: { "@type": "Brand", name: brandName },
    ...(ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount: ratingCount,
      },
    }),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailPage
        product={product}
        detail={detail}
        related={related}
        legal={detail.legal.length > 0 ? detail.legal : legal}
        reviews={reviews}
        perks={{
          shipping: detail.perks.shipping || perks.shipping,
          returns: detail.perks.returns || perks.returns,
          warranty: detail.perks.warranty || perks.warranty,
        }}
      />
    </>
  );
}
