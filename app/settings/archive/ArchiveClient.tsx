'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types/customers'
import { Archive, RefreshCw, User, Calendar, Phone, RotateCcw } from 'lucide-react'

interface ArchiveClientProps {
  initialCustomers: Customer[]
}

export default function ArchiveClient({ initialCustomers }: ArchiveClientProps) {
  const router = useRouter()
  const [restoringId, setRestoringId] = useState<string | null>(null)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Archive className="w-6 h-6 text-[#D4AF37]" />
          Archive
        </h1>
        <button
          onClick={() => router.refresh()}
          className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm">
        Deleted customers are moved here. You can restore them anytime.
      </p>

      {/* Archive List */}
      {initialCustomers.length === 0 ? (
        <div className="text-center py-16 bg-black/20 border border-[#D4AF37]/10 rounded-xl">
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Archive is Empty</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            When you delete customers, they will appear here. You can restore them or permanently delete them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{customer.full_name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm">
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
                className="px-4 py-2 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {restoringId === customer.id ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}