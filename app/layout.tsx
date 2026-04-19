import type { Metadata, Viewport } from 'next'
import { Merriweather, Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import InventoryInitializer from '@/components/InventoryInitializer'

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'UrbanShopOS | Premium Commerce Management',
  description: 'The all-in-one shop operating system. Clean, simple, and powerful management for your business.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UrbanShopOS',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${merriweather.variable} ${inter.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          <InventoryInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
