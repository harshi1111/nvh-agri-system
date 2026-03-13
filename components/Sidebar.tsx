'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Settings,
  Archive,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSidebar } from '@/contexts/SidebarContext' // import context hook

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Accounting', href: '/accounting', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Archive', href: '/settings/archive', icon: Archive }, 
  
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const { collapsed, setCollapsed } = useSidebar() // use context

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

  // Personalised greeting
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
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image 
                src="/images/logo-alone (1).png" 
                alt="NVH Logo" 
                fill
                sizes="(max-width: 768px) 100vw, 33vw" 
                className="object-contain"
                onError={(e) => {
                  // If image fails to load, replace with fallback
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-logo');
                }}
              />
              {/* Fallback div will be shown if image fails */}
              <div className="absolute inset-0 hidden fallback-logo:flex items-center justify-center bg-[#D4AF37] rounded-lg">
                <span className="text-black font-bold text-xl">NVH</span>
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">nvhFlow</h1>
              <p className="text-xs text-gray-400">Vetiver CRM</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 relative mx-auto">
            <Image 
              src="/images/logo-alone.png" 
              alt="NVH Logo" 
              fill
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-logo');
              }}
            />
            <div className="absolute inset-0 hidden fallback-logo:flex items-center justify-center bg-[#D4AF37] rounded-lg">
              <span className="text-black font-bold text-xl">NVH</span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-[#D4AF37] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Greeting – only show when expanded */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-[#D4AF37]/20">
          <p className="text-sm text-gray-300">{getGreeting()}</p>
          {user?.email && <p className="text-xs text-gray-500 mt-1">{user.email}</p>}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
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
              {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] gold-pulse" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
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