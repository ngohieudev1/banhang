'use client'
import type { Product } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = product.compareAtPrice ?? 0
  let lowestAmount = 0
  let highestAmount = 0

  const skus = product.skus?.filter((sku) => typeof sku === 'object') ?? []

  if (skus.length > 0) {
    const skusOrderedByPrice = skus
      .sort((a, b) => {
        const aPrice = a.priceInVND ?? 0
        const bPrice = b.priceInVND ?? 0
        return aPrice - bPrice
      })

    const lowestSku = skusOrderedByPrice[0]
    const highestSku = skusOrderedByPrice[skusOrderedByPrice.length - 1]
    if (lowestSku && highestSku) {
      lowestAmount = lowestSku.priceInVND ?? 0
      highestAmount = highestSku.priceInVND ?? 0
      amount = 0
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-medium">{product.title}</h1>
        <div className="uppercase font-mono">
          {skus.length > 0 ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
          ) : (
            <Price amount={amount} />
          )}
        </div>
      </div>
      {product.shortDescription ? (
        <p className="text-sm text-gray-600">{product.shortDescription}</p>
      ) : null}
      <hr />
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>
    </div>
  )
}
