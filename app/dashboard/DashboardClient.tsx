'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FolderTree, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Plus,
  Quote,
  Hand
} from 'lucide-react'

interface DashboardClientProps {
  customers: any[]
  recentTransactions: any[]
}

// Spinning slot machine number component
function SpinningNumber({ value, color }: { value: number; color?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const spinIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setSpinning(true)
    const spinDuration = 1000
    const spinSteps = 20
    let step = 0

    spinIntervalRef.current = setInterval(() => {
      step++
      setDisplayValue(Math.floor(Math.random() * 100))
      
      if (step >= spinSteps) {
        clearInterval(spinIntervalRef.current)
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
      {displayValue}
    </span>
  )
}

export default function DashboardClient({ customers, recentTransactions }: DashboardClientProps) {
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [currentQuote, setCurrentQuote] = useState('')
  const [quoteFade, setQuoteFade] = useState(false)
  const [birdVisible, setBirdVisible] = useState(true)
  const [handWave, setHandWave] = useState(false)

  // Expanded and more powerful quotes
  const quotes = [
    "The secret of getting ahead is getting started. — Mark Twain",
    "It does not matter how slowly you go as long as you do not stop. — Confucius",
    "Profit is better than wages. — Virgil",
    "What is worth doing is worth doing well. — Aristotle",
    "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
    "Your most valuable asset is your customer. — Peter Drucker",
    "Growth is never by mere chance; it is the result of forces working together. — James Cash Penney",
    "Trust is the glue of life. It's the most essential ingredient in effective communication. — Stephen Covey",
    "From little seeds grow mighty trees. — Greek Proverb",
    "Innovation distinguishes between a leader and a follower. — Steve Jobs",
    "Quality is not an act, it is a habit. — Aristotle",
    "Don't count the days, make the days count. — Muhammad Ali",
    "The harder you work, the luckier you get. — Gary Player",
    "Success is not final, failure is not fatal. — Winston Churchill",
    "Do what you can, with what you have, where you are. — Theodore Roosevelt",
    "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
    "Opportunities don't happen. You create them. — Chris Grosser",
    "It always seems impossible until it's done. — Nelson Mandela",
    "The future depends on what you do today. — Mahatma Gandhi",
    "Well done is better than well said. — Benjamin Franklin"
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    const now = new Date()
    const formatted = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    setCurrentDate(formatted)

    // Random initial quote
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setCurrentQuote(quotes[randomIndex])

    // Change quote every 30 seconds
    const quoteInterval = setInterval(() => {
      setQuoteFade(true)
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * quotes.length)
        setCurrentQuote(quotes[randomIndex])
        setQuoteFade(false)
      }, 500)
    }, 30000)

    setTimeout(() => setBirdVisible(false), 8000)

    return () => clearInterval(quoteInterval)
  }, [])

  const stats = useMemo(() => {
    let totalProjects = 0
    let activeProjects = 0
    let totalDebit = 0
    let totalCredit = 0

    customers.forEach(customer => {
      totalProjects += customer.projects?.length || 0
      customer.projects?.forEach((project: any) => {
        if (project.status === 'active') activeProjects++
        project.transactions?.forEach((t: any) => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
        })
      })
    })

    return {
      totalCustomers: customers.length,
      activeProjects,
      netBalance: totalCredit - totalDebit
    }
  }, [customers])

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden">
      {/* BACKGROUND (EXACTLY LIKE LOGIN PAGE) */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        
        <div className="absolute bottom-1/3 left-0 right-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-full h-16"
              style={{
                left: `${i * 10}%`,
                transform: `translateY(${Math.sin(i) * 5}px)`,
              }}
            >
              <div className="relative">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-1 bg-[#D4AF37]/30"
                    style={{
                      left: `${j * 8}px`,
                      height: '20px',
                      bottom: '0',
                      transform: `rotate(${Math.sin(j + i) * 10}deg)`,
                      animation: `sway ${3 + j}s ease-in-out infinite`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/50 pointer-events-none"></div>

        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: '15%', top: '20%', delay: '0s' },
            { left: '85%', top: '30%', delay: '2s' },
            { left: '45%', top: '70%', delay: '1s' },
            { left: '70%', top: '15%', delay: '3s' },
            { left: '25%', top: '85%', delay: '2.5s' },
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#D4AF37]/20 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float-particle 15s linear infinite`,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* SIMPLE FLYING BIRD - NO EXCESS */}
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
        
        {/* HEADER ROW: Greeting left, Quote right */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-white">{greeting}</h1>
              <button
                onMouseEnter={() => setHandWave(true)}
                onMouseLeave={() => setHandWave(false)}
                className={`text-4xl transition-all duration-300 ${handWave ? 'scale-125 rotate-12' : ''}`}
              >
                👋
              </button>
            </div>
            <p className="text-lg text-[#D4AF37] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4AF37]" />
              {currentDate}
            </p>
            <p className="text-base text-gray-400">here's your business overview</p>
          </div>

          <div className={`w-full lg:w-96 bg-[#1A2A1A]/80 border-l-2 border-[#D4AF37] pl-5 py-4 rounded-r transition-opacity duration-500 ${quoteFade ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-base text-gray-300 italic flex items-start gap-2">
              <Quote className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
              <span>{currentQuote}</span>
            </p>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Manage Farmers */}
            <div className="bg-[#0F180F] border border-[#5F8B4B]/30 rounded-lg p-4 hover:border-[#7AA65A] transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#7AA65A]" />
                <h3 className="text-sm font-medium text-white">Manage Farmers</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Add, edit, or view farmer details</p>
              <button
                onClick={() => router.push('/customers')}
                className="text-xs text-[#7AA65A] hover:text-[#9BC87A] flex items-center gap-1 group/btn"
              >
                Go to Farmers <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Financial Overview */}
            <div className="bg-[#0F180F] border border-[#B85C3A]/30 rounded-lg p-4 hover:border-[#D47B5A] transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#D47B5A]" />
                <h3 className="text-sm font-medium text-white">Financial Overview</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Track expenses and investments</p>
              <button
                onClick={() => router.push('/accounting')}
                className="text-xs text-[#D47B5A] hover:text-[#E89B7A] flex items-center gap-1 group/btn"
              >
                View Finances <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Generate Reports */}
            <div className="bg-[#0F180F] border border-[#B88D2B]/30 rounded-lg p-4 hover:border-[#D4AF37] transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-medium text-white">Generate Reports</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Export financial data</p>
              <button
                onClick={() => router.push('/reports')}
                className="text-xs text-[#D4AF37] hover:text-[#E5C158] flex items-center gap-1 group/btn"
              >
                Create Report <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="lg:col-span-1 bg-[#0F180F] border border-[#7A5C3A]/30 rounded-lg p-4 hover:border-[#9C7C5A] transition-all">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#D4AF37] rounded-full"></span>
              Key Metrics
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Total Customers</p>
                <p className="text-xl font-semibold text-[#7AA65A]">
                  <SpinningNumber value={stats.totalCustomers} color="text-[#7AA65A]" />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Projects</p>
                <p className="text-xl font-semibold text-[#D47B5A]">
                  <SpinningNumber value={stats.activeProjects} color="text-[#D47B5A]" />
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Net Balance</p>
                <p className={`text-xl font-semibold ${stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#C85A4A]'}`}>
                  ₹<SpinningNumber value={Math.abs(stats.netBalance)} color={stats.netBalance >= 0 ? 'text-[#7AA65A]' : 'text-[#C85A4A]'} />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {/* Recent Activity */}
          <div className="bg-[#0F180F] border border-[#4F8A8A]/30 rounded-lg p-4 hover:border-[#6FAAAA] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6FAAAA]" />
                Recent Activity
              </h3>
              <button
                onClick={() => router.push('/accounting')}
                className="text-xs text-[#6FAAAA] hover:text-[#8FCACA] flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentTransactions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No recent transactions</p>
              ) : (
                recentTransactions.slice(0, 4).map((t: any, idx: number) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/projects/${t.project_id}`)}
                    className="flex items-center justify-between p-2 bg-black/20 rounded-lg hover:bg-[#6FAAAA]/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3 h-3 text-[#6FAAAA] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{t.projects?.customers?.full_name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{t.description || t.type}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-medium ${t.credit_amount > 0 ? 'text-[#7AA65A]' : 'text-[#C85A4A]'}`}>
                      {t.credit_amount > 0 ? '+' : '-'} ₹{(t.credit_amount || t.debit_amount).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#0F180F] border border-[#8B6B4D]/30 rounded-lg p-4 hover:border-[#AD8B6D] transition-all">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#AD8B6D]" />
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { icon: Users, label: 'Customers', path: '/customers', color: 'text-[#7AA65A]' },
                { icon: DollarSign, label: 'Accounting', path: '/accounting', color: 'text-[#D47B5A]' },
                { icon: TrendingUp, label: 'Reports', path: '/reports', color: 'text-[#D4AF37]' },
                { icon: FolderTree, label: 'Archive', path: '/settings/archive', color: 'text-[#AD8B6D]' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-[#AD8B6D]/10 transition-all"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-gray-300">{item.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push('/customers')}
              className="w-full py-2 bg-[#D4AF37] text-[#0A120A] text-xs font-medium rounded-lg hover:bg-[#E5C158] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Add Customer
            </button>
          </div>
        </div>
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
        /* SIMPLE BIRD FLIGHT */
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
      `}</style>
    </div>
  )
}