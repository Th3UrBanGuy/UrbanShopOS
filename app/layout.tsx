import type { Metadata } from 'next'
import { Merriweather, Inter } from 'next/font/google'
import './globals.css'

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AERO RESIN | Future Tactile Interfaces',
  description: 'Immerse yourself in a tactile digital experience. Bridging hardware and software with fluid resin aesthetics.',
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
        {children}
      </body>
    </html>
  )
}
