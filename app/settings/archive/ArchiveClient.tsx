'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types/customers'
import { Archive, RefreshCw, User, Calendar, Phone, RotateCcw, Sparkles } from 'lucide-react'

interface ArchiveClientProps {
  initialCustomers: Customer[]
}

export default function ArchiveClient({ initialCustomers }: ArchiveClientProps) {
  const router = useRouter()
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [birdVisible, setBirdVisible] = useState(true)

  // Bird disappears after flying across
  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  const handleRestore = async (customerId: string) => {
    setRestoringId(customerId)
    try {
      const response = await fetch('/api/restore-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Restore failed:', error)
    } finally {
      setRestoringId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      
      {/* ========== GOLDEN HOUR BACKGROUND ========== */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#4A3A2A] to-transparent"></div>
        
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
                    className="absolute w-1 bg-[#D4AF37]/40"
                    style={{
                      left: `${j * 8}px`,
                      height: '20px',
                      bottom: '0',
                      transform: `rotate(${Math.sin(j + i) * 10}deg)`,
                      animation: `sway ${3 + j}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#F2A385]/20 rounded-full blur-3xl animate-sunset"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl animate-sunset-delayed"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-[#3A2A1A]/30 to-[#0A120A]/70 pointer-events-none"></div>

        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: '15%', top: '20%', delay: '0s' },
            { left: '85%', top: '30%', delay: '2s' },
            { left: '45%', top: '70%', delay: '1s' },
            { left: '70%', top: '15%', delay: '3s' },
            { left: '25%', top: '85%', delay: '2.5s' },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#D4AF37]/40 rounded-full"
              style={{
                left: p.left,
                top: p.top,
                animation: `float-particle ${15 + i * 2}s linear infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path 
              d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" 
              fill="#1a2a1a" 
              stroke="#d4af37" 
              strokeWidth="1.5"
            />
            <path 
              d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" 
              fill="#0A120A" 
              stroke="#d4af37" 
              strokeWidth="1"
              className="animate-wing"
            />
            <circle cx="16" cy="14" r="1.2" fill="#d4af37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="backdrop-blur-sm bg-black/30 p-4 rounded-2xl border border-[#d4af37]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af37]/20 rounded-full">
              <Archive className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Archive</h1>
              <p className="text-xs text-[#d4af37]/70">Restore deleted customers</p>
            </div>
          </div>
          <button
            onClick={() => router.refresh()}
            className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors group"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-[#d4af37] group-hover:rotate-180 transition-all duration-500" />
          </button>
        </div>

        {/* Description Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-4">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            Deleted customers are moved here. You can restore them anytime.
          </p>
        </div>

        {/* Archive List */}
        {initialCustomers.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-12 text-center">
            <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Archive is Empty</h3>
            <p className="text-gray-400 max-w-md mx-auto text-sm">
              When you delete customers, they will appear here. You can restore them or permanently delete them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialCustomers.map((customer, idx) => (
              <div
                key={customer.id}
                className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#d4af37]/50 transition-all hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] group animate-slide-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{customer.full_name}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Phone className="w-3 h-3" />
                        {customer.contact_number}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        Deleted: {formatDate(customer.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(customer.id)}
                  disabled={restoringId === customer.id}
                  className="px-4 py-2 bg-[#d4af37] text-[#0A120A] rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2 self-start md:self-center hover:scale-105 active:scale-95"
                >
                  <RotateCcw className={`w-4 h-4 ${restoringId === customer.id ? 'animate-spin' : ''}`} />
                  {restoringId === customer.id ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes sunset {
          0% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.6; transform: scale(1.3); }
          100% { opacity: 0.2; transform: scale(0.9); }
        }
        .animate-sunset {
          animation: sunset 12s ease-in-out infinite;
        }
        .animate-sunset-delayed {
          animation: sunset 16s ease-in-out infinite;
          animation-delay: -2s;
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bird-fly {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { transform: translateX(30vw) translateY(-10px); }
          60% { transform: translateX(60vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); opacity: 1; }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        @keyframes wing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
      `}</style>
    </div>
  )
}