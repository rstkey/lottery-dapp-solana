import './globals.css'
import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SolanaProvider } from '@/solana/provider/solana-provider'
import { Header } from '@/components/shared'
import { cn } from '@/lib/utils/utils'
import { Toaster } from 'sonner'
import AppProvider from '@/context/AppProvider'

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
            <Toaster />
          </AppProvider>
        </SolanaProvider>
      </body>
    </html>
  )
}
