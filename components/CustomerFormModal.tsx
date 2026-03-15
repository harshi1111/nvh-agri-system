'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer } from '@/lib/actions/customers'
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

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerAdded?: () => void
}

export default function CustomerFormModal({ isOpen, onClose, onCustomerAdded }: CustomerFormModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAadhaarScanner, setShowAadhaarScanner] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    aadhaar_number: '',
    contact_number: '',
    email: '',
    gender: '',
    date_of_birth: '',
    address: '',
    aadhaar_images: [] as string[],
    status: 'active'
  })

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        full_name: '',
        aadhaar_number: '',
        contact_number: '',
        email: '',
        gender: '',
        date_of_birth: '',
        address: '',
        aadhaar_images: [],
        status: 'active'
      })
      setError(null)
      setShowAadhaarScanner(false)
    }
  }, [isOpen])

  const convertDateToInputFormat = (dateStr: string): string => {
    const parts = dateStr.split(/[\/\-]/)
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month}-${day}`
    }
    return dateStr
  }

  const handleScanComplete = (data: {
    imagePath: string
    aadhaarNumber?: string
    dob?: string
    gender?: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      aadhaar_images: [data.imagePath],
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
      formDataObj.append('full_name', formData.full_name)
      formDataObj.append('aadhaar_number', formData.aadhaar_number)
      formDataObj.append('contact_number', formData.contact_number)
      formDataObj.append('email', formData.email)
      formDataObj.append('gender', formData.gender)
      formDataObj.append('date_of_birth', formData.date_of_birth)
      formDataObj.append('address', formData.address)
      formDataObj.append('aadhaar_images', JSON.stringify(formData.aadhaar_images))
      formDataObj.append('status', formData.status)
      
      const result = await createCustomer(formDataObj)
      
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
        if (onCustomerAdded) {
          onCustomerAdded()
        }
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20">
          <h2 className="text-lg font-semibold text-[#D4AF37]">
            Add New Customer
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAadhaarScanner(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors text-sm"
            >
              <Camera className="w-4 h-4" />
              Upload Aadhaar
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {showAadhaarScanner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
            <div className="w-full max-w-md">
              <AadhaarScanner
                customerId="temp"
                onScanComplete={handleScanComplete}
                onClose={() => setShowAadhaarScanner(false)}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Full Name <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              placeholder="Enter customer name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Contact <span className="text-[#D4AF37]">*</span>
              </label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
                placeholder="10 digits"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={formData.aadhaar_number}
                onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
                placeholder="12 digits"
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white"
            />
          </div>

          {formData.aadhaar_images.length > 0 && (
            <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400">
                ✓ Aadhaar data extracted
              </p>
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#D4AF37]/10 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs bg-[#D4AF37] text-[#0A100A] font-medium rounded-lg hover:bg-[#C6A032] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}