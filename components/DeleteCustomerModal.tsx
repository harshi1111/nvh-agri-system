'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomer } from '@/lib/actions/customers'
import { X, AlertTriangle } from 'lucide-react'

interface DeleteCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  customerName: string
  onDeleted?: () => void
}

export default function DeleteCustomerModal({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName,
  onDeleted 
}: DeleteCustomerModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteCustomer(customerId)
      
      if (result.error) {
        setError(result.error)
      } else {
        onDeleted?.()
        onClose()
        router.push('/customers') // Redirect to customers list
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0A100A] border border-red-500/30 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Customer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-2">
            Are you sure you want to delete <span className="text-[#D4AF37] font-semibold">{customerName}</span>?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This customer will be moved to archive. All associated projects and transactions will be preserved but hidden. You can restore them later from Settings.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? 'Moving to Archive...' : 'Yes, Move to Archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}