import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MOOD - Adaptive Artistic Environment Controller',
  description: 'AI-Powered system for controlling interactive art installations',
  keywords: ['ai', 'art', 'installation', 'interactive', 'mood', 'automation'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mood-system.com',
    title: 'MOOD - Adaptive Artistic Environment Controller',
    description: 'AI-Powered system for controlling interactive art installations',
    siteName: 'MOOD System',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOOD - Adaptive Artistic Environment Controller',
    description: 'AI-Powered system for controlling interactive art installations',
    creator: '@yourusername',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {children}
        </div>
      </body>
    </html>
  )
}