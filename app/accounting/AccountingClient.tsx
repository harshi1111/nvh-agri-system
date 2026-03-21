'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FolderTree,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  Leaf,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Transaction {
  id: string
  sequence_number: number
  date: string
  type: string
  description: string
  quantity: number | null
  unit: string | null
  debit_amount: number
  credit_amount: number
}

interface Project {
  id: string
  name: string
  status: string
  acres: number | null
  transactions: Transaction[]
}

interface Customer {
  id: string
  full_name: string
  contact_number: string
  is_active: boolean
  projects: Project[]
}

interface AccountingClientProps {
  customers: Customer[]
  totalCount: number
  currentPage: number
  pageSize: number
}

// Spinning number component
function SpinningNumber({ value, color, suffix = '' }: { value: number; color?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const spinIntervalRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    setSpinning(true)
    const spinDuration = 1000
    const spinSteps = 20
    let step = 0

    spinIntervalRef.current = setInterval(() => {
      step++
      setDisplayValue(Math.floor(Math.random() * value) || Math.floor(Math.random() * 100))
      if (step >= spinSteps) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current)
        }
        setDisplayValue(value)
        setSpinning(false)
      }
    }, spinDuration / spinSteps)

    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
    }
  }, [value])

  return (
    <span className={`inline-block transition-all duration-100 ${spinning ? 'animate-spin-slot' : ''} ${color}`}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// Loading Skeleton Component
function AccountingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A120A] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Skeleton */}
        <div className="bg-black/40 border border-[#D4AF37]/20 rounded-2xl p-4 animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-700 rounded mt-2"></div>
        </div>
        
        {/* Chart Skeleton */}
        <div className="bg-black/40 border border-[#5F8B4B]/30 rounded-xl p-4 animate-pulse">
          <div className="h-32 flex items-end gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 bg-gray-700 rounded-t-lg" style={{ height: `${40 + Math.random() * 40}px` }}></div>
            ))}
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <div className="bg-black/40 border border-[#5F8B4B]/30 rounded-xl p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-16 bg-gray-700 rounded mb-2"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Customers List Skeleton */}
        <div className="bg-black/40 border border-[#5F8B4B]/30 rounded-xl p-5">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-[#5F8B4B]/20 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="h-5 w-32 bg-gray-700 rounded"></div>
                      <div className="h-3 w-24 bg-gray-700 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="w-20 h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountingClient({ customers, totalCount, currentPage, pageSize }: AccountingClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [birdVisible, setBirdVisible] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; duration: number }>>([])
  
  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Generate particles only on client
  useEffect(() => {
    const positions = []
    for (let i = 0; i < 20; i++) {
      positions.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: 15 + Math.random() * 10
      })
    }
    setParticles(positions)
  }, [])

  // Reset expanded when page changes
  useEffect(() => {
    setExpandedCustomers([])
  }, [currentPage])

  // Animated glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Bird animation
  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  // Helper function to check if date is within range
  const isDateInRange = (dateString: string) => {
    const transactionDate = new Date(dateString)
    if (dateRange.from && new Date(dateRange.from) > transactionDate) return false
    if (dateRange.to && new Date(dateRange.to) < transactionDate) return false
    return true
  }

  // Get only active customers
  const activeCustomers = useMemo(() => {
    return customers.filter(c => c.is_active === true)
  }, [customers])

  // Get customers to display based on dropdown selection
  const dropdownFilteredCustomers = useMemo(() => {
    if (selectedCustomer === 'all') {
      return activeCustomers
    }
    return activeCustomers.filter(c => c.id === selectedCustomer)
  }, [activeCustomers, selectedCustomer])

  // Apply search filter
  const displayedCustomers = useMemo(() => {
    return dropdownFilteredCustomers.filter(customer =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_number.includes(searchTerm)
    )
  }, [dropdownFilteredCustomers, searchTerm])

  // Get projects for selected customer
  const availableProjects = useMemo(() => {
    if (selectedCustomer === 'all') return []
    const customer = activeCustomers.find(c => c.id === selectedCustomer)
    return customer?.projects || []
  }, [activeCustomers, selectedCustomer])

  // Calculate monthly data with date range filter
  const monthlyData = useMemo(() => {
    const result: { month: string; profit: number; isProfit: boolean; actualValue: number }[] = []
    
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const monthStr = date.toLocaleString('en-US', { month: 'short' })
      
      let totalCredit = 0
      let totalDebit = 0
      
      customers.forEach(customer => {
        customer.projects?.forEach(project => {
          project.transactions?.forEach(t => {
            const transactionDate = new Date(t.date)
            if (transactionDate.getMonth() === date.getMonth() && 
                transactionDate.getFullYear() === date.getFullYear() &&
                isDateInRange(t.date)) {
              totalCredit += t.credit_amount || 0
              totalDebit += t.debit_amount || 0
            }
          })
        })
      })
      
      const netProfit = totalCredit - totalDebit
      result.push({
        month: monthStr,
        profit: Math.max(15, Math.min(100, Math.abs(netProfit) / 1000)),
        isProfit: netProfit >= 0,
        actualValue: netProfit
      })
    }
    return result
  }, [customers, dateRange])

  // Calculate overall totals with date filter
  const overallTotals = useMemo(() => {
    let totalDebit = 0
    let totalCredit = 0
    let totalTransactions = 0

    customers.forEach(customer => {
      customer.projects?.forEach(project => {
        project.transactions?.forEach(t => {
          if (isDateInRange(t.date)) {
            totalDebit += t.debit_amount || 0
            totalCredit += t.credit_amount || 0
            totalTransactions++
          }
        })
      })
    })

    return {
      netBalance: totalCredit - totalDebit,
      totalDebit,
      totalCredit,
      totalTransactions
    }
  }, [customers, dateRange])

  // Calculate liquidity with date filter
  const liquidity = useMemo(() => {
    let totalInflow = 0
    let totalOutflow = 0
    let transactionCount = 0
    
    const now = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)
    
    customers.forEach(customer => {
      customer.projects?.forEach(project => {
        project.transactions?.forEach(t => {
          const txDate = new Date(t.date)
          if (txDate >= threeMonthsAgo && isDateInRange(t.date)) {
            totalInflow += t.credit_amount || 0
            totalOutflow += t.debit_amount || 0
            transactionCount++
          }
        })
      })
    })
    
    const velocity = transactionCount > 0 ? (totalInflow + totalOutflow) / transactionCount : 0
    const ratio = totalOutflow > 0 ? (totalInflow / totalOutflow) * 100 : 0
    
    return {
      velocity: Math.round(velocity),
      ratio: Math.round(ratio),
      isHealthy: ratio > 110
    }
  }, [customers, dateRange])

  // Calculate per-customer totals
  const customerTotals = useMemo(() => {
    return displayedCustomers.map(customer => {
      let debit = 0
      let credit = 0
      let projectCount = 0
      let transactionCount = 0

      customer.projects.forEach(project => {
        if (selectedProject !== 'all' && project.id !== selectedProject) return
        
        projectCount++
        const filteredTransactions = project.transactions.filter(t => isDateInRange(t.date))
        
        filteredTransactions.forEach(t => {
          debit += t.debit_amount || 0
          credit += t.credit_amount || 0
          transactionCount++
        })
      })

      return {
        ...customer,
        totals: {
          debit,
          credit,
          balance: credit - debit,
          projectCount,
          transactionCount
        }
      }
    })
  }, [displayedCustomers, selectedProject, dateRange])

  // Toggle customer expansion
  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCustomer('all')
    setSelectedProject('all')
    setDateRange({ from: '', to: '' })
    setSearchTerm('')
  }

  // Handle page navigation with loading state
  const goToPage = async (page: number) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
    setTimeout(() => setIsLoading(false), 500)
  }

  // Pagination functions
  const totalPages = Math.ceil(totalCount / pageSize)

  const getCardColor = (value: number, type: 'balance' | 'debit' | 'credit' | 'neutral') => {
    if (type === 'balance') {
      return value >= 0 
        ? 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30 hover:border-emerald-400' 
        : 'from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/30 hover:border-rose-400'
    }
    if (type === 'debit') {
      return 'from-rose-500/20 via-rose-500/10 to-transparent border-rose-500/30 hover:border-rose-400'
    }
    if (type === 'credit') {
      return 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30 hover:border-emerald-400'
    }
    return 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30 hover:border-amber-400'
  }

  const getFilterColor = (filterName: string, isActive: boolean) => {
    if (!isActive) return 'border-[#5F8B4B]/30 bg-black/40'
    
    switch(filterName) {
      case 'search': return 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50'
      case 'customer': return 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
      case 'project': return 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/50'
      case 'from': return 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/50'
      case 'to': return 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
      default: return 'border-[#5F8B4B]/30 bg-black/40'
    }
  }

  // Show skeleton while loading and no data
  if (isLoading && customers.length === 0) {
    return <AccountingSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-transparent to-amber-950/30 animate-gradient-xy"></div>
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-[#D4AF37]/30 rounded-full"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animation: `float-particle ${particle.duration}s linear infinite`,
                  animationDelay: particle.delay,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path 
              d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" 
              fill="#1A2A1A" 
              stroke="#D4AF37" 
              strokeWidth="1.5"
            />
            <path 
              d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" 
              fill="#0A120A" 
              stroke="#D4AF37" 
              strokeWidth="1"
              className="animate-wing"
            />
            <circle cx="16" cy="14" r="1.2" fill="#D4AF37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center backdrop-blur-sm bg-black/20 p-4 rounded-2xl border border-[#D4AF37]/20">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Accounting
              {isLoading && <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />}
              <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${glowIntensity === 0 ? 'from-emerald-500/20 to-amber-500/20' : glowIntensity === 1 ? 'from-amber-500/20 to-rose-500/20' : 'from-rose-500/20 to-emerald-500/20'} animate-pulse`}>
                live
              </span>
            </h1>
            <p className="text-[#D4AF37] text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <Button 
            onClick={() => {
              setIsLoading(true)
              router.refresh()
              setTimeout(() => setIsLoading(false), 1000)
            }}
            variant="outline"
            disabled={isLoading}
            className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left side - Chart */}
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-sm border border-[#5F8B4B]/30 rounded-xl p-4 hover:border-[#D4AF37]/50 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#D4AF37]" />
                Profit/Loss Trend
                {dateRange.from && dateRange.to && (
                  <span className="text-[10px] text-cyan-400 ml-2">filtered</span>
                )}
              </h3>
              <span className="text-xs text-gray-500">last 6 months</span>
            </div>
            
            <div className="flex items-end justify-between h-32 mt-4">
              {monthlyData.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-12 group/chart">
                  <div className="relative w-full">
                    <div 
                      className={`w-full bg-gradient-to-t ${item.isProfit ? 'from-emerald-500 via-emerald-400 to-emerald-300' : 'from-rose-500 via-rose-400 to-rose-300'} rounded-t-lg transition-all duration-300 group-hover/chart:scale-105 group-hover/chart:shadow-lg group-hover/chart:shadow-${item.isProfit ? 'emerald' : 'rose'}-500/50`}
                      style={{ height: `${item.profit}px` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/chart:opacity-100 transition-all duration-300 whitespace-nowrap border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/20">
                        ₹{Math.abs(item.actualValue).toLocaleString()}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-[#D4AF37]/30"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2 group">
                <div className="w-3 h-3 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded animate-pulse group-hover:scale-110 transition-transform"></div>
                <span className="text-gray-400">Profit</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="w-3 h-3 bg-gradient-to-t from-rose-500 to-rose-300 rounded animate-pulse group-hover:scale-110 transition-transform"></div>
                <span className="text-gray-400">Loss</span>
              </div>
              <div className="flex items-center gap-2 ml-auto group">
                <Droplets className={`w-3 h-3 ${liquidity.isHealthy ? 'text-emerald-400' : 'text-amber-400'} group-hover:scale-110 transition-transform`} />
                <span className={`text-[10px] ${liquidity.isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                  liquidity {liquidity.ratio}%
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-3">
            <div className="bg-black/40 backdrop-blur-sm border border-[#5F8B4B]/30 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-400">Financial details are now available on the Dashboard</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-2 text-xs text-[#D4AF37] hover:underline"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>

        {/* FILTERS CARD */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#5F8B4B]/30 rounded-xl p-5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              Filters
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="h-8 text-sm text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 group-focus-within:text-emerald-400 transition-colors">Search</label>
              <div className="relative">
                <Input
                  placeholder="Name or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedFilter('search')
                  }}
                  onBlur={() => setSelectedFilter(null)}
                  onFocus={() => setSelectedFilter('search')}
                  className={`h-10 text-sm bg-black/60 backdrop-blur-sm border-2 transition-all duration-300 ${getFilterColor('search', selectedFilter === 'search' || Boolean(searchTerm))} text-white focus:ring-4 focus:ring-emerald-500/30`}
                />
                {searchTerm && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white animate-bounce">
                    ✓
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 group-focus-within:text-amber-400 transition-colors">Customer</label>
              <Select 
                value={selectedCustomer} 
                onValueChange={(val) => {
                  setSelectedCustomer(val)
                  setSelectedFilter('customer')
                }}
              >
                <SelectTrigger 
                  className={`h-10 text-sm bg-black/60 backdrop-blur-sm border-2 transition-all duration-300 ${getFilterColor('customer', selectedCustomer !== 'all')} text-white`}
                  onMouseEnter={() => setSelectedFilter('customer')}
                  onMouseLeave={() => setSelectedFilter(null)}
                >
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-sm border-[#D4AF37]/30 text-white max-h-48">
                  <SelectItem value="all">All customers</SelectItem>
                  {activeCustomers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Project */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 group-focus-within:text-rose-400 transition-colors">Project</label>
              <Select 
                value={selectedProject} 
                onValueChange={(val) => {
                  setSelectedProject(val)
                  setSelectedFilter('project')
                }}
                disabled={selectedCustomer === 'all'}
              >
                <SelectTrigger 
                  className={`h-10 text-sm bg-black/60 backdrop-blur-sm border-2 transition-all duration-300 ${getFilterColor('project', selectedProject !== 'all')} text-white disabled:opacity-50`}
                  onMouseEnter={() => setSelectedFilter('project')}
                  onMouseLeave={() => setSelectedFilter(null)}
                >
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-sm border-[#D4AF37]/30 text-white">
                  <SelectItem value="all">All projects</SelectItem>
                  {availableProjects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* From Date */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 group-focus-within:text-cyan-400 transition-colors">From</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  setDateRange({ ...dateRange, from: e.target.value })
                  setSelectedFilter('from')
                }}
                onBlur={() => setSelectedFilter(null)}
                onFocus={() => setSelectedFilter('from')}
                className={`h-10 text-sm bg-black/60 backdrop-blur-sm border-2 transition-all duration-300 ${getFilterColor('from', Boolean(dateRange.from))} text-white focus:ring-4 focus:ring-cyan-500/30`}
              />
            </div>
            
            {/* To Date */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 group-focus-within:text-purple-400 transition-colors">To</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => {
                  setDateRange({ ...dateRange, to: e.target.value })
                  setSelectedFilter('to')
                }}
                onBlur={() => setSelectedFilter(null)}
                onFocus={() => setSelectedFilter('to')}
                className={`h-10 text-sm bg-black/60 backdrop-blur-sm border-2 transition-all duration-300 ${getFilterColor('to', Boolean(dateRange.to))} text-white focus:ring-4 focus:ring-purple-500/30`}
              />
            </div>
          </div>
        </div>

        {/* CUSTOMER FINANCIAL SUMMARY */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#5F8B4B]/30 rounded-xl p-5 hover:border-[#D4AF37]/30 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <h3 className="text-lg font-medium text-white">Customer Financial Summary</h3>
            <span className="text-sm text-gray-500 ml-auto">({customerTotals.length} customers)</span>
            {(selectedProject !== 'all' || dateRange.from || dateRange.to) && (
              <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-full">
                filtered
              </span>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#D4AF37]/20 scrollbar-track-transparent pr-2">
            <div className="space-y-3">
              {customerTotals.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-12 h-12 text-[#D4AF37]/30 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm text-gray-500">No customers found</p>
                </div>
              ) : (
                customerTotals.map((customer, idx) => (
                  <div 
                    key={customer.id} 
                    className="border border-[#5F8B4B]/20 rounded-xl overflow-hidden transition-all hover:border-[#D4AF37]/50 hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#D4AF37]/20"
                    style={{ animation: `fadeInUp 0.3s ${idx * 0.05}s both` }}
                  >
                    {/* Customer Header */}
                    <div 
                      className={`bg-gradient-to-r p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
                        customer.totals.balance >= 0 
                          ? 'from-emerald-950/50 to-emerald-900/30 hover:from-emerald-900/70' 
                          : 'from-rose-950/50 to-rose-900/30 hover:from-rose-900/70'
                      }`}
                      onClick={() => toggleCustomer(customer.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center border-2 transition-all group-hover:scale-110 ${
                          customer.totals.balance >= 0 
                            ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' 
                            : 'from-rose-500/20 to-rose-500/5 border-rose-500/30'
                        }`}>
                          <span className={`text-sm font-bold ${
                            customer.totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {customer.full_name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base text-white font-medium truncate">{customer.full_name}</h4>
                          <p className="text-xs text-gray-500">{customer.contact_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Balance</p>
                          <p className={`text-base font-semibold ${customer.totals.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ₹{Math.abs(customer.totals.balance).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/customers/${customer.id}`)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {expandedCustomers.includes(customer.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCustomers.includes(customer.id) && (
                      <div className="p-4 bg-black/60 backdrop-blur-sm space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="group/stat relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent rounded-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 blur-md"></div>
                            <div className="relative bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/30 rounded-lg p-3 hover:border-rose-400 transition-all hover:scale-105">
                              <p className="text-xs text-gray-400">Debit</p>
                              <p className="text-lg font-semibold text-rose-400 truncate">₹{customer.totals.debit.toLocaleString()}</p>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover/stat:translate-x-full transition-transform duration-1000"></div>
                            </div>
                          </div>
                          
                          <div className="group/stat relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 blur-md"></div>
                            <div className="relative bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-lg p-3 hover:border-emerald-400 transition-all hover:scale-105">
                              <p className="text-xs text-gray-400">Credit</p>
                              <p className="text-lg font-semibold text-emerald-400 truncate">₹{customer.totals.credit.toLocaleString()}</p>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover/stat:translate-x-full transition-transform duration-1000"></div>
                            </div>
                          </div>
                          
                          <div className="group/stat relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500 blur-md"></div>
                            <div className="relative bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-lg p-3 hover:border-amber-400 transition-all hover:scale-105">
                              <p className="text-xs text-gray-400">Transactions</p>
                              <p className="text-lg font-semibold text-amber-400">{customer.totals.transactionCount}</p>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover/stat:translate-x-full transition-transform duration-1000"></div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-[#D4AF37] flex items-center gap-1 mb-2">
                            <FolderTree className="w-4 h-4 animate-pulse" />
                            Projects ({customer.projects.length})
                          </h5>
                          {customer.projects
                            .filter(p => selectedProject === 'all' || p.id === selectedProject)
                            .map((project, pIdx) => {
                              const filteredTransactions = project.transactions.filter(t => isDateInRange(t.date))
                              const projectDebit = filteredTransactions.reduce((sum, t) => sum + (t.debit_amount || 0), 0)
                              const projectCredit = filteredTransactions.reduce((sum, t) => sum + (t.credit_amount || 0), 0)
                              const projectBalance = projectCredit - projectDebit

                              return (
                                <div 
                                  key={project.id} 
                                  className={`group/project relative mb-2 rounded-lg p-3 transition-all hover:scale-[1.02] ${
                                    projectBalance >= 0 
                                      ? 'bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40' 
                                      : 'bg-gradient-to-r from-rose-500/5 to-transparent border border-rose-500/20 hover:border-rose-500/40'
                                  }`}
                                  style={{ animation: `fadeInUp 0.2s ${pIdx * 0.03}s both` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/project:translate-x-full transition-transform duration-1000"></div>
                                  
                                  <div className="flex justify-between items-center relative z-10">
                                    <div>
                                      <p className="text-sm text-white font-medium">{project.name}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {project.status} · {filteredTransactions.length} transactions
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-semibold ${projectBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        ₹{Math.abs(projectBalance).toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        D:₹{projectDebit.toLocaleString()} C:₹{projectCredit.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(selectedCustomer !== 'all' || selectedProject !== 'all' || dateRange.from || dateRange.to || searchTerm) && (
          <div className="text-sm text-gray-400 flex flex-wrap items-center gap-2 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-[#D4AF37]/20 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Active filters:</span>
            {searchTerm && (
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-500/30">
                "{searchTerm}"
              </span>
            )}
            {selectedCustomer !== 'all' && (
              <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs border border-amber-500/30">
                Customer
              </span>
            )}
            {selectedProject !== 'all' && (
              <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-xs border border-rose-500/30">
                Project: {availableProjects.find(p => p.id === selectedProject)?.name || selectedProject}
              </span>
            )}
            {dateRange.from && (
              <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs border border-cyan-500/30">
                From {new Date(dateRange.from).toLocaleDateString()}
              </span>
            )}
            {dateRange.to && (
              <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs border border-purple-500/30">
                To {new Date(dateRange.to).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} (Total customers: {totalCount})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="border-[#D4AF37]/30 text-[#D4AF37]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="border-[#D4AF37]/30 text-[#D4AF37]"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes sunrise {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }
        @keyframes bird-fly {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { transform: translateX(30vw) translateY(-10px); }
          60% { transform: translateX(60vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); opacity: 1; }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        @keyframes wing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
        @keyframes spin-slot {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100px); }
        }
        .animate-spin-slot {
          animation: spin-slot 0.05s infinite linear;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
        @keyframes gradient-xy {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}