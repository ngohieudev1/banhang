'use client'
import { Product } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

  const skus = product.skus?.filter((sku) => typeof sku === 'object') ?? []

  const selectedSku = useMemo(() => {
    if (skus.length) {
      const skuId = searchParams.get('sku')
      return skus.find((sku) => String(sku?.id) === skuId) ?? skus[0]
    }
    return undefined
  }, [searchParams, skus])

  const stockQuantity = useMemo(() => {
    if (selectedSku) {
      return selectedSku.inventory || 0
    }
    return product.inventory ?? 0
  }, [selectedSku])

  if (skus.length > 0 && !selectedSku) {
    return null
  }

  return (
    <div className="uppercase font-mono text-sm font-medium text-gray-500">
      {stockQuantity < 10 && stockQuantity > 0 && <p>Only {stockQuantity} left in stock</p>}
      {(stockQuantity === 0 || !stockQuantity) && <p>Out of stock</p>}
    </div>
  )
}
