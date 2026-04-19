import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Providers } from '@/components/Providers'
import { Toaster } from '@/components/ui/Toaster'

export const metadata: Metadata = {
  title: 'Vinay Nagar Mart | Grocery delivery in minutes',
  description: 'A professional Zepto-inspired grocery shopping experience for Vinay Nagar.',
  keywords: 'grocery delivery, fruits, vegetables, dairy, atta, rice, snacks, beverages, Vinay Nagar',
  openGraph: {
    title: 'Vinay Nagar Mart',
    description: 'A grocery-first storefront for fast local delivery in Vinay Nagar.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-950">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <div className="h-[100px] md:h-[115px]" />
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
