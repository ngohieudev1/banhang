"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnnouncementBar from "@/components/feature/AnnouncementBar";
import SiteHeader from "@/components/feature/SiteHeader";
import SiteFooter from "@/components/feature/SiteFooter";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import type { CartSelection } from "./components/ProductInfo";
import ProductSections from "./components/ProductSections";
import ProductReviews from "./components/ProductReviews";
import RelatedProducts from "./components/RelatedProducts";
import type { ReviewSummary } from "@/lib/reviews";
import type { Product } from "@/mocks/products";
import type { ProductDetail } from "@/lib/products";
import { detailRows } from "@/mocks/productDetails";
import { useCart } from "@/hooks/useCart";
import { useT } from "@/i18n/LocaleProvider";

type ProductDetailPageProps = {
  product: Product;
  detail: ProductDetail;
  related: Product[];
  legal: [string, string][];
  reviews: ReviewSummary;
  perks?: { shipping: string; returns: string; warranty: string };
};

export default function ProductDetailPage({
  product,
  detail,
  related,
  legal,
  reviews,
  perks,
}: ProductDetailPageProps) {
  const { addItem, closeCart } = useCart();
  const router = useRouter();
  const { t } = useT();
  const [activeImage, setActiveImage] = useState(0);
  const [skuIndex, setSkuIndex] = useState(0);
  const id = product.id;
  const skus = product.skus ?? [];
  const sku = skus[skuIndex];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveImage(0);
    setSkuIndex(0);
  }, [id]);

  const selectSku = (index: number) => {
    setSkuIndex(index);
    setActiveImage(0);
  };

  // Giá, giá niêm yết lấy theo SKU đang chọn; không có SKU thì dùng giá sản phẩm.
  const shown: Product = sku
    ? { ...product, price: sku.price, compareAtPrice: sku.compareAtPrice }
    : product;

  const handleAddToCart = (selection: CartSelection) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: shown.price,
      image: sku?.image || product.image,
      color: selection.color,
      sku: sku?.id,
      skuCode: sku?.code,
      quantity: selection.quantity,
    });
  };

  const handleBuyNow = (selection: CartSelection) => {
    handleAddToCart(selection);
    closeCart();
    router.push("/checkout");
  };

  const hasDiscount =
    typeof shown.compareAtPrice === "number" && shown.compareAtPrice > shown.price;
  const galleryImages = sku
    ? sku.images
    : [product.image, ...detail.extraImages, product.hoverImage].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-site px-4 py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <ProductGallery
                images={galleryImages}
                active={activeImage}
                onChange={setActiveImage}
                name={product.name}
                tag={product.tag}
                onSale={hasDiscount}
                skus={skus.map((s) => ({ id: s.id, name: s.name, image: s.image }))}
                skuIndex={skuIndex}
                onSelectSku={selectSku}
              />
            </div>

            <div className="lg:col-span-5">
              <ProductInfo
                product={shown}
                images={galleryImages}
                active={activeImage}
                onSelectImage={setActiveImage}
                skus={skus}
                skuIndex={skuIndex}
                onSelectSku={selectSku}
                perks={perks}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />

              <ProductSections
                story={sku?.description ?? detail.description ?? t("product.defaultStory")}
                highlights={
                  sku && sku.highlights.length > 0
                    ? sku.highlights
                    : detail.highlights.length > 0
                      ? detail.highlights
                      : [t("product.defaultHighlight1"), t("product.defaultHighlight2")]
                }
                details={
                  sku && sku.specs.length > 0
                    ? sku.specs
                    : detail.specs.length > 0
                      ? detail.specs
                      : detailRows
                }
                legal={legal}
              />
            </div>
          </div>
        </div>

        <ProductReviews slug={product.id} summary={reviews} />

        <RelatedProducts products={related} />
      </main>

      <SiteFooter />
    </div>
  );
}