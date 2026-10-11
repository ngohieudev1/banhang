import ProductCard from "@/components/base/ProductCard";
import type { Product } from "@/mocks/products";
import { useT } from "@/i18n/LocaleProvider";

type RelatedProductsProps = {
  products: Product[];
  onQuickAdd?: (product: Product) => void;
};

export default function RelatedProducts({ products, onQuickAdd }: RelatedProductsProps) {
  const { t } = useT();
  if (products.length === 0) return null;

  return (
    <section className="border-t border-background-200 bg-background-100">
      <div className="mx-auto max-w-site px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-700">
              {t("product.related.eyebrow")}
            </span>
            <h2 className="mt-2 font-heading text-2xl font-black uppercase tracking-[-0.03em] text-foreground-950 md:text-3xl">
              {t("product.related.title")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} onQuickAdd={onQuickAdd} />
          ))}
        </div>
      </div>
    </section>
  );
}