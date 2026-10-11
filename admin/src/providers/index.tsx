import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
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
