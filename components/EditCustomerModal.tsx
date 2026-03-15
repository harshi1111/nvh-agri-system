'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types/customers'
import { updateCustomer } from '@/lib/actions/customers'
import { Camera, X } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import AadhaarScanner with a loading fallback
const AadhaarScanner = dynamic(
  () => import('@/app/customers/AadhaarScanner'),
  {
    loading: () => (
      <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-400">Loading scanner...</p>
      </div>
    ),
    ssr: false
  }
)

interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer
  onCustomerUpdated?: (customer: Customer) => void
}

export default function EditCustomerModal({ isOpen, onClose, customer, onCustomerUpdated }: EditCustomerModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAadhaarScanner, setShowAadhaarScanner] = useState(false)
  
  // Form state - using is_active (boolean)
  const [formData, setFormData] = useState({
    full_name: customer.full_name,
    aadhaar_number: customer.aadhaar_number || '',
    contact_number: customer.contact_number || '',
    email: customer.email || '',
    gender: customer.gender || '',
    date_of_birth: customer.date_of_birth || '',
    address: customer.address || '',
    is_active: customer.is_active // boolean true/false
  })

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name,
        aadhaar_number: customer.aadhaar_number || '',
        contact_number: customer.contact_number || '',
        email: customer.email || '',
        gender: customer.gender || '',
        date_of_birth: customer.date_of_birth || '',
        address: customer.address || '',
        is_active: customer.is_active
      })
    }
  }, [customer])

  // Helper to convert date from DD/MM/YYYY to YYYY-MM-DD
  const convertDateToInputFormat = (dateStr: string): string => {
    const parts = dateStr.split(/[\/\-]/)
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month}-${day}`
    }
    return dateStr // fallback
  }

  const handleScanComplete = (data: {
    imageUrl: string
    aadhaarNumber?: string
    dob?: string
    gender?: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      aadhaar_number: data.aadhaarNumber || prev.aadhaar_number,
      date_of_birth: data.dob ? convertDateToInputFormat(data.dob) : prev.date_of_birth,
      gender: data.gender || prev.gender,
    }))
    setShowAadhaarScanner(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('id', customer.id)
      formDataObj.append('full_name', formData.full_name)
      formDataObj.append('aadhaar_number', formData.aadhaar_number)
      formDataObj.append('contact_number', formData.contact_number)
      formDataObj.append('email', formData.email)
      formDataObj.append('gender', formData.gender)
      formDataObj.append('date_of_birth', formData.date_of_birth)
      formDataObj.append('address', formData.address)
      // Convert boolean to string for FormData
      formDataObj.append('is_active', String(formData.is_active))
      
      const result = await updateCustomer(formDataObj)
      
      if (result.error) {
        setError(result.error)
      } else {
        if (onCustomerUpdated && result.customer) {
          onCustomerUpdated(result.customer)
        }
        onClose()
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20">
          <h2 className="text-lg font-semibold text-[#D4AF37]">Edit Customer</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAadhaarScanner(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors text-sm"
            >
              <Camera className="w-4 h-4" />
              Upload Aadhaar
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Aadhaar Scanner Modal */}
        {showAadhaarScanner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-md">
              <AadhaarScanner
                customerId={customer.id}
                onScanComplete={handleScanComplete}
                onClose={() => setShowAadhaarScanner(false)}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Full Name <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
              className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              placeholder="Enter customer name"
            />
          </div>

          {/* Row: Contact + Aadhaar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Contact <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                required
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
                placeholder="10 digits"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Aadhaar</label>
              <input
                type="text"
                value={formData.aadhaar_number}
                onChange={(e) => setFormData({...formData, aadhaar_number: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
                placeholder="12 digits"
                maxLength={12}
              />
            </div>
          </div>

          {/* Row: Email + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row: DOB + Status (Active/Inactive) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
              <select
                value={String(formData.is_active)}
                onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              placeholder="Enter full address"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs bg-[#D4AF37] text-[#0A100A] font-medium rounded-lg hover:bg-[#C6A032] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}