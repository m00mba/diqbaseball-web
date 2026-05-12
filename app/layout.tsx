import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diamond IQ Baseball',
  description: 'The verified recruiting platform for baseball players, coaches, scouts, and facilities.',
  openGraph: {
    title: 'Diamond IQ Baseball',
    description: 'Verified metrics. Real connections. Recruit smarter.',
    url: 'https://diqbaseball.com',
    siteName: 'Diamond IQ Baseball',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
