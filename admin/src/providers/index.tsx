'use client'

import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useEffect } from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason instanceof Error ? event.reason.message : String(event.reason)
      if (message.startsWith('Failed to fetch addresses:')) event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    skus: true,
                  },
                  skus: {
                    inventory: true,
                  },
                },
              },
            }}
            currenciesConfig={{
              defaultCurrency: 'VND',
              supportedCurrencies: [{ code: 'VND', decimals: 0, label: 'Vietnamese Dong', symbol: '₫' }],
            }}
            paymentMethods={[
              { name: 'cod', label: 'Thanh toán khi nhận hàng (COD)', initiatePayment: true, confirmOrder: true },
            ]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
