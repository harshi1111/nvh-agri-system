import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import SimpleCursor from '@/components/SimpleCursor'
import { SidebarProvider } from '@/contexts/SidebarContext'
import MainContent from '@/components/MainContent'  // new import

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'nvhFlow - CRM',
  description: 'CRM for NVH Agri Green',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <SimpleCursor />
          <div className="flex">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}