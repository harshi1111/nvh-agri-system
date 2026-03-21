'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  Archive,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield,
  ReceiptText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSidebar } from '@/contexts/SidebarContext'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Archive', href: '/settings/archive', icon: Archive }, 
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const { collapsed, setCollapsed } = useSidebar()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSidebar = () => setCollapsed(!collapsed)

  const getGreeting = () => {
    if (!user) return 'Welcome!'
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Farmer'
    const greetings = ['Hey', 'Welcome', 'Namaste', 'Vanakkam', 'Hello']
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    return `${randomGreeting}, ${name}!`
  }

  return (
    <aside className={`bg-[#0A0F0A] border-r border-[#D4AF37]/20 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header - Logo when expanded, just toggle button when collapsed */}
      <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-lg border-2 border-[#D4AF37]"></div>
                <Image 
                  src="/images/logo-alone (1).png" 
                  alt="NVH Logo" 
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw" 
                  className="object-contain relative z-10 p-1.5"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">NVH</h1>
                <p className="text-xs text-gray-400">Vetiver System</p>
              </div>
            </div>
            
            <button
              onClick={toggleSidebar}
              className="relative group"
              aria-label="Collapse sidebar"
            >
              <div className="absolute inset-0 rounded-full bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/20 transition-all duration-300 blur-md"></div>
              <div className="relative w-8 h-8 rounded-full border-2 border-[#D4AF37] bg-black/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <ChevronLeft className="w-5 h-5 text-[#D4AF37] transition-all duration-300 group-hover:-translate-x-0.5" />
              </div>
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={toggleSidebar}
              className="relative group"
              aria-label="Expand sidebar"
            >
              <div className="absolute inset-0 rounded-full bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/20 transition-all duration-300 blur-md"></div>
              <div className="relative w-8 h-8 rounded-full border-2 border-[#D4AF37] bg-black/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <ChevronRight className="w-5 h-5 text-[#D4AF37] transition-all duration-300 group-hover:translate-x-0.5" />
              </div>
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-6 py-4 border-b border-[#D4AF37]/20">
          <p className="text-sm text-[#D4AF37]">{getGreeting()}</p>
          {user?.email && <p className="text-xs text-gray-500 mt-1">{user.email}</p>}
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'text-gray-400 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37]'
              }`}
              title={collapsed ? item.name : ''}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
              {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#D4AF37]/20">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-xl transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}