'use client'

import { Button } from '@/components/ui/button'
import type { Product } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { addItem, cart, isLoading } = useCart()
  const searchParams = useSearchParams()

  const skus = product.skus?.filter((sku) => typeof sku === 'object') ?? []

  const selectedSku = useMemo(() => {
    if (skus.length) {
      const skuId = searchParams.get('sku')
      return skus.find((sku) => String(sku?.id) === skuId) ?? skus[0]
    }
    return undefined
  }, [searchParams, skus])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      addItem({
        product: product.id,
        ...(selectedSku ? { variant: selectedSku.id } : {}),
      }).then(() => {
        toast.success('Item added to cart.')
      })
    },
    [addItem, product, selectedSku],
  )

  const disabled = useMemo<boolean>(() => {
    if (skus.length > 0 && selectedSku) {
      return (selectedSku.inventory ?? 0) <= 0
    }
    return (
      (product.priceInVND ?? product.compareAtPrice ?? 0) <= 0 ||
      (typeof product.inventory === 'number' && product.inventory <= 0)
    )
  }, [selectedSku, skus, product.priceInVND, product.compareAtPrice, product.inventory])

  return (
    <Button
      aria-label="Add to cart"
      variant={'outline'}
      className={clsx({
        'hover:opacity-90': true,
      })}
      disabled={disabled || isLoading}
      onClick={addToCart}
      type="submit"
    >
      Add To Cart
    </Button>
  )
}
