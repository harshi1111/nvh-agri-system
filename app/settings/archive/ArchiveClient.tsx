'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types/customers'
import { 
  Archive, RefreshCw, User, Calendar, Phone, RotateCcw, Sparkles, 
  Search, Eye, Trash2, ChevronLeft, ChevronRight, FileText, AlertCircle, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ArchiveClientProps {
  initialCustomers: Customer[]
}

const PAGE_SIZE = 10

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ArchiveClient({ initialCustomers }: ArchiveClientProps) {
  const router = useRouter()
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [birdVisible, setBirdVisible] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  // Filter customers by search - safe check for archive_reason
  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter(customer => {
      const matchesName = customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const matchesPhone = customer.contact_number?.includes(searchTerm) || false
      const matchesEmail = customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      const matchesReason = customer.archive_reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      
      return matchesName || matchesPhone || matchesEmail || matchesReason
    })
  }, [initialCustomers, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE)
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredCustomers.slice(start, start + PAGE_SIZE)
  }, [filteredCustomers, currentPage])

  const handleRestore = async (customerId: string) => {
    setRestoringId(customerId)
    try {
      const response = await fetch('/api/restore-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      })
      if (response.ok) {
        toast.success('Customer restored successfully')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to restore customer')
      }
    } catch (error) {
      console.error('Restore failed:', error)
      toast.error('Failed to restore customer')
    } finally {
      setRestoringId(null)
    }
  }

  const handlePermanentDelete = async (customerId: string, customerName: string) => {
    if (!confirm(`⚠️ WARNING: This will permanently delete "${customerName}" and all their data. This action CANNOT be undone. Are you sure?`)) {
      return
    }
    
    setDeletingId(customerId)
    try {
      const response = await fetch('/api/customers/permanent-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      })
      if (response.ok) {
        toast.success('Customer permanently deleted')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#4A3A2A] to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 right-0">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute bottom-0 w-full h-16" style={{ left: `${i * 10}%`, transform: `translateY(${Math.sin(i) * 5}px)` }}>
              <div className="relative">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="absolute w-1 bg-[#D4AF37]/40" style={{ left: `${j * 8}px`, height: '20px', bottom: '0', transform: `rotate(${Math.sin(j + i) * 10}deg)`, animation: `sway ${3 + j}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#F2A385]/20 rounded-full blur-3xl animate-sunset"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl animate-sunset-delayed"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-[#3A2A1A]/30 to-[#0A120A]/70 pointer-events-none"></div>
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" fill="#1a2a1a" stroke="#d4af37" strokeWidth="1.5"/>
            <path d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" fill="#0A120A" stroke="#d4af37" strokeWidth="1" className="animate-wing"/>
            <circle cx="16" cy="14" r="1.2" fill="#d4af37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="backdrop-blur-sm bg-black/30 p-4 rounded-2xl border border-[#d4af37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af37]/20 rounded-full">
              <Archive className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Archive</h1>
              <p className="text-xs text-[#d4af37]/70">Restore or permanently delete archived customers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, phone, or reason..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-3 py-2 bg-black/50 border border-[#d4af37]/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] w-64"
              />
            </div>
            <button
              onClick={() => router.refresh()}
              className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors group"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-[#d4af37] group-hover:rotate-180 transition-all duration-500" />
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-4">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            {initialCustomers.length} archived customer{initialCustomers.length !== 1 ? 's' : ''} • 
            {filteredCustomers.length !== initialCustomers.length && ` ${filteredCustomers.length} matching`}
          </p>
        </div>

        {/* Archive List */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-12 text-center">
            <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Archive is Empty</h3>
            <p className="text-gray-400 max-w-md mx-auto text-sm">
              When you archive customers, they will appear here. You can restore them or permanently delete them.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedCustomers.map((customer, idx) => (
                <div
                  key={customer.id}
                  className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/20 rounded-xl p-4 hover:border-[#d4af37]/50 transition-all hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] group animate-slide-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <User className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-white">{customer.full_name}</h3>
                          {customer.archive_reason && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                              📝 {customer.archive_reason.length > 30 ? customer.archive_reason.substring(0, 30) + '...' : customer.archive_reason}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Phone className="w-3 h-3" />
                            {customer.contact_number}
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3 h-3" />
                            Archived: {formatDateTime(customer.archived_at || customer.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-start md:self-center">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestore(customer.id)}
                        disabled={restoringId === customer.id}
                        className="px-3 py-1.5 bg-[#d4af37] text-[#0A120A] rounded-lg hover:bg-[#e5c158] transition-all disabled:opacity-50 text-xs font-medium flex items-center gap-1"
                      >
                        <RotateCcw className={`w-3 h-3 ${restoringId === customer.id ? 'animate-spin' : ''}`} />
                        {restoringId === customer.id ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(customer.id, customer.full_name)}
                        disabled={deletingId === customer.id}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#d4af37] text-black'
                              : 'border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowDetailModal(false)}>
          <div className="bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-black/40">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-semibold text-white">Customer Details</h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-white font-medium">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contact Number</p>
                  <p className="text-white">{selectedCustomer.contact_number}</p>
                </div>
                {selectedCustomer.email && (
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-white">{selectedCustomer.email}</p>
                  </div>
                )}
                {selectedCustomer.aadhaar_number && (
                  <div>
                    <p className="text-xs text-gray-400">Aadhaar Number</p>
                    <p className="text-white font-mono">{selectedCustomer.aadhaar_number}</p>
                  </div>
                )}
                {selectedCustomer.gender && (
                  <div>
                    <p className="text-xs text-gray-400">Gender</p>
                    <p className="text-white">{selectedCustomer.gender}</p>
                  </div>
                )}
                {selectedCustomer.date_of_birth && (
                  <div>
                    <p className="text-xs text-gray-400">Date of Birth</p>
                    <p className="text-white">{formatDate(selectedCustomer.date_of_birth)}</p>
                  </div>
                )}
              </div>
              
              {selectedCustomer.archive_reason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-red-400" />
                    Archive Reason
                  </p>
                  <p className="text-white text-sm mt-1">{selectedCustomer.archive_reason}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Archived on: {formatDateTime(selectedCustomer.archived_at || selectedCustomer.created_at)}
                  </p>
                </div>
              )}
              
              {selectedCustomer.address && (
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-white text-sm">{selectedCustomer.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } }
        @keyframes sunset { 0% { opacity: 0.2; transform: scale(0.9); } 50% { opacity: 0.6; transform: scale(1.3); } 100% { opacity: 0.2; transform: scale(0.9); } }
        .animate-sunset { animation: sunset 12s ease-in-out infinite; }
        .animate-sunset-delayed { animation: sunset 16s ease-in-out infinite; animation-delay: -2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bird-fly { 0% { transform: translateX(-200px) translateY(0); opacity: 0; } 5% { opacity: 1; } 30% { transform: translateX(30vw) translateY(-10px); } 60% { transform: translateX(60vw) translateY(5px); } 90% { transform: translateX(90vw) translateY(-5px); opacity: 1; } 100% { transform: translateX(110vw) translateY(0); opacity: 0; } }
        @keyframes wing { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-20deg); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
        .animate-bird-fly { animation: bird-fly 8s ease-in-out forwards; }
        .animate-wing { animation: wing 0.3s ease-in-out infinite; transform-origin: left center; }
      `}</style>
    </div>
  )
}