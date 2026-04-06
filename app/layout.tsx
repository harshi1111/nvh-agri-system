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
        {/* Small floating demo badge - only on demo site */}
        {process.env.NEXT_PUBLIC_IS_DEMO === 'true' && (
          <div className="fixed bottom-4 right-4 z-50 bg-[#D4AF37]/10 backdrop-blur-sm border border-[#D4AF37]/30 rounded-full px-3 py-1.5 text-[10px] text-[#D4AF37] shadow-lg">
            🧪 Demo Mode
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
