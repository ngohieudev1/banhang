'use client'

import type { Product } from '@/payload-types'

export function VariantSelector({ product }: { product: Product }) {
  // SKUs are now handled via the product gallery and image selection
  // This component is no longer needed as variant selection is managed in the SKU/image gallery flow
  return null
}
