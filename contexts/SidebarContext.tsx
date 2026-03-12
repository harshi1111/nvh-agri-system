'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextType = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // Load initial state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) setCollapsed(JSON.parse(saved))
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within SidebarProvider')
  return context
}