import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PingPong Tournament',
  description: 'Interactive ping pong tournament platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  )
}