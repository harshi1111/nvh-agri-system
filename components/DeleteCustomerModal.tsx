'use client'

import { useState } from 'react'
import { X, AlertCircle, FileText } from 'lucide-react'
import { deleteCustomer } from '@/lib/actions/customers'
import { toast } from 'react-hot-toast'

interface DeleteCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  customerName: string
  onDeleted?: () => void
}

const archiveReasons = [
  'No longer farming',
  'Moved to different area',
  'Payment issues',
  'Requested deletion',
  'Duplicate entry',
  'Inactive for long time',
  'Other'
]

export default function DeleteCustomerModal({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName,
  onDeleted 
}: DeleteCustomerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason
    
    if (!finalReason) {
      setError('Please select or enter a reason for archiving')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteCustomer(customerId, finalReason)
      
      if (result.error) {
        setError(result.error)
      } else {
        toast.success(`Customer "${customerName}" archived`)
        onDeleted?.()
        onClose()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] rounded-2xl w-full max-w-md border-2 border-red-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-5 border-b border-red-500/20 bg-black/40">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-white">Archive Customer</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-red-500/10 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-300">
            Are you sure you want to archive <span className="text-[#D4AF37] font-medium">{customerName}</span>?
          </p>
          <p className="text-xs text-gray-500">Archived customers can be restored later from the Archive page.</p>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Reason for archiving <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value)
                if (e.target.value !== 'Other') setCustomReason('')
                setError(null)
              }}
              className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Select a reason...</option>
              {archiveReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>

            {selectedReason === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value)
                  setError(null)
                }}
                className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] mt-2"
              />
            )}
          </div>

          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Archiving...
              </>
            ) : (
              'Archive Customer'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}