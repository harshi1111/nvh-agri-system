'use client'

import { useSidebar } from '@/contexts/SidebarContext'

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <main className={`flex-1 min-h-screen bg-[#0A0F0A] transition-all duration-300 ${
      collapsed ? 'ml-20' : 'ml-64'
    }`}>
      {children}
    </main>
  )
}