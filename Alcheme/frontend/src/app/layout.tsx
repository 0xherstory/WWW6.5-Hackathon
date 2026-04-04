import type { Metadata } from 'next'
import { Cinzel, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: 'Alcheme',
  description: 'What you do and how you think build who you are.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${cinzel.variable} ${cormorant.variable} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
