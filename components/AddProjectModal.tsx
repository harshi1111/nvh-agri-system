'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions/projects'
import { X } from 'lucide-react'

interface Project {
  id: string
  name: string
  acres?: number
  country?: string
  state?: string
  district?: string
  village?: string
  status?: string
}

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  onProjectAdded?: (project: Project) => void  // Added callback prop
}

// Indian states and districts data (simplified - you can expand this)
const locationData = {
  'India': {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    // Add more states and districts as needed
  }
}

export default function AddProjectModal({ isOpen, onClose, customerId, onProjectAdded }: AddProjectModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [selectedCountry, setSelectedCountry] = useState('India')
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [village, setVillage] = useState('')
  const [projectName, setProjectName] = useState('')
  const [acres, setAcres] = useState('')
  const [status, setStatus] = useState('active')

  // Get states for selected country
  const states = selectedCountry === 'India' 
    ? Object.keys(locationData.India) 
    : []

  // Get districts for selected state
  const districts = selectedCountry === 'India' && selectedState
    ? locationData.India[selectedState as keyof typeof locationData.India] || []
    : []

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCountry('India')
      setSelectedState('')
      setSelectedDistrict('')
      setVillage('')
      setProjectName('')
      setAcres('')
      setStatus('active')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('customer_id', customerId)
      
      const result = await createProject(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        // Call the callback if provided
        if (onProjectAdded && result.project) {
          onProjectAdded(result.project)
        }

        onClose()
        router.refresh() // Refresh the page to show new project
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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20">
          <h2 className="text-xl font-semibold text-[#D4AF37]">Add New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hidden customer_id field */}
          <input type="hidden" name="customer_id" value={customerId} />

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="e.g., Organic Farm Phase 1"
            />
          </div>

          {/* Acres */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Acres
            </label>
            <input
              type="number"
              name="acres"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="e.g., 5.5"
            />
          </div>

          {/* Location Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <select
                name="country"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedState('')
                  setSelectedDistrict('')
                }}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="India">India</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State
              </label>
              <select
                name="state"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value)
                  setSelectedDistrict('')
                }}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50"
                disabled={states.length === 0}
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                District
              </label>
              <select
                name="district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50"
                disabled={districts.length === 0}
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Village */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Village / City
              </label>
              <input
                type="text"
                name="village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="e.g., Sadashivgad"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#D4AF37] text-[#0A100A] font-medium rounded-lg hover:bg-[#C6A032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
