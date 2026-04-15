import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'VenueProof — Protect Your Damage Deposit',
  description: 'Document your venue\'s condition before and after every event. Protect your damage deposit with timestamped, photo-verified evidence.',
  keywords: 'venue damage documentation, deposit protection, event venue, damage deposit, venue condition report',
  openGraph: {
    title: 'VenueProof — The Next Event Could Cost You Thousands. Do You Have Proof?',
    description: 'Document before and after every event. Protect your damage deposit with AI-powered evidence.',
    type: 'website',
    url: 'https://venueproof.io',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-charcoal-800 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
