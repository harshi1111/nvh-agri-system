import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import SimpleCursor from '@/components/SimpleCursor'
import { SidebarProvider } from '@/contexts/SidebarContext'
import MainContent from '@/components/MainContent'

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
        {/* ✅ ADD THIS DEMO BANNER HERE */}
        {process.env.NEXT_PUBLIC_IS_DEMO === 'true' && (
          <div className="bg-amber-600 text-white text-center py-2.5 text-sm font-medium sticky top-0 z-50">
             DEMO MODE - Data resets daily | Email: demo@example.com | Password: demo123
          </div>
        )}
        
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
