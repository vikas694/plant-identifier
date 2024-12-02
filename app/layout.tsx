import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plant Identifier',
  description: 'Identify plants instantly with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="container mx-auto px-4 py-8 flex-grow">
          {children}
        </main>
        <footer className="bg-plant-green-100 p-4 text-center">
          <p className="text-plant-green-900">© {new Date().getFullYear()} Plant Identifier</p>
        </footer>
      </body>
    </html>
  )
}