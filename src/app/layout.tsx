import './globals.css'
import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils/utils'
import { Inter } from 'next/font/google'
import { Header } from '@/components/shared'
import AppProvider from '@/context/AppProvider'
import { SolanaProvider } from '@/solana/provider/solana-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lottery Dapp',
  description: 'Lottery ',
}

export default function RootLayout({ children, }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "flex flex-col h-screen")}>
        <SolanaProvider>
          <AppProvider>
            <Header />
            {children}
          </AppProvider>
        </SolanaProvider>
      </body>
    </html>
  )
}
