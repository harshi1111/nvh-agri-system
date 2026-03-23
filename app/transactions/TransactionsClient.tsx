'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, X, ChevronLeft, ArrowLeft, Star, Users, Calendar, Leaf, 
  Filter, ChevronDown, Calendar as CalendarIcon, RefreshCw
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import CustomerDetailClient with loading state
const CustomerDetailClient = dynamic(
  () => import('@/app/customers/[id]/CustomerDetailClient'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#D4AF37] text-sm">Loading customer details...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

interface Customer {
  id: string
  full_name: string
  contact_number: string
  email: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at?: string
  aadhaar_number: string | null
  gender: string | null
  date_of_birth: string | null
  transactionCount?: number
  projects?: any[]
}

interface TransactionsClientProps {
  customers: Customer[]
  frequentCustomers: Customer[]
  transactionTypes: any[]
}

export default function TransactionsClient({ customers, frequentCustomers }: TransactionsClientProps) {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [birdVisible, setBirdVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Update active filters count
  useEffect(() => {
    let count = 0
    if (dateRange.from || dateRange.to) count++
    setActiveFiltersCount(count)
  }, [dateRange])

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers
    return customers.filter(c => 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_number.includes(searchTerm)
    )
  }, [customers, searchTerm])

  // Fetch customer details with projects when selected
  const fetchCustomerDetails = async (customerId: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.from) params.append('fromDate', dateRange.from)
      if (dateRange.to) params.append('toDate', dateRange.to)
      
      const response = await fetch(`/api/customers/${customerId}?${params.toString()}`)
      const data = await response.json()
      console.log('Fetched customer with projects:', data.projects?.length || 0, 'projects')
      setSelectedCustomer(data)
    } catch (error) {
      console.error('Error fetching customer details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    fetchCustomerDetails(customer.id)
  }

  // Back to customer list
  const handleBack = () => {
    setSelectedCustomer(null)
  }

  // Clear filters
  const clearFilters = () => {
    setDateRange({ from: '', to: '' })
  }

  // Apply filters and refresh
  const applyFilters = () => {
    if (selectedCustomer) {
      fetchCustomerDetails(selectedCustomer.id)
    }
  }

  // Bird animation
  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/30 pointer-events-none"></div>
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M8 12 C 12 10, 16 10, 20 12 C 18 15, 14 17, 10 15 C 8 13, 8 12, 8 12" fill="#1A2A1A" stroke="#D4AF37" strokeWidth="1.2"/>
            <path d="M16 12 L 22 8 L 20 12 L 22 16 L 16 12" fill="#0A120A" stroke="#D4AF37" strokeWidth="1" className="animate-wing"/>
            <circle cx="14" cy="12" r="1" fill="#D4AF37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        
        {!selectedCustomer ? (
          // CUSTOMER SELECTION VIEW
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                Transactions
                <span className="text-xs px-2 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                  Select a farmer
                </span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">Choose a farmer to view and manage their projects and transactions</p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* FILTERS SECTION */}
            <div className="mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors mb-3"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#D4AF37] text-black text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateRange.from}
                          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                          className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          placeholder="From"
                        />
                        <input
                          type="date"
                          value={dateRange.to}
                          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                          className="bg-black/60 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          placeholder="To"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800/50 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-3 py-1.5 text-xs bg-[#D4AF37] text-black rounded-lg hover:bg-[#C6A032] transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Frequent Customers Section */}
            {frequentCustomers.length > 0 && !searchTerm && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="text-sm font-medium text-white">Frequent Farmers</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frequentCustomers.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-sm text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all hover:scale-105"
                    >
                      {customer.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Customers List */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-medium text-white">All Farmers</h2>
                <span className="text-xs text-gray-500">({filteredCustomers.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="group bg-black/30 hover:bg-black/40 border border-[#D4AF37]/20 rounded-xl p-4 text-left transition-all hover:border-[#D4AF37]/50 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#D4AF37]">
                          {customer.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{customer.full_name}</h3>
                        <p className="text-xs text-gray-500">{customer.contact_number}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                    </div>
                    {customer.address && (
                      <p className="text-[10px] text-gray-600 mt-2 truncate">{customer.address}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No farmers found</p>
                <p className="text-sm text-gray-600 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          // CUSTOMER DETAIL VIEW
          <div>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back to all farmers</span>
            </button>

            {/* Active Filters Badge */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex items-center gap-2 text-xs">
                <span className="text-gray-400">Active filters:</span>
                {dateRange.from && (
                  <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">
                    From {dateRange.from}
                  </span>
                )}
                {dateRange.to && (
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                    To {dateRange.to}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-[#D4AF37] ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Customer Detail Component */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#D4AF37] text-sm">Loading customer details...</p>
                </div>
              </div>
            ) : (
              selectedCustomer && (
                <CustomerDetailClient 
                  customer={selectedCustomer}
                  initialProjects={selectedCustomer.projects || []}
                />
              )
            )}
          </div>
        )}
      </div>

      <style jsx>{`
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
        @keyframes sunrise {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
        .animate-sunrise {
          animation: sunrise 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}