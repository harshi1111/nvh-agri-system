'use client'

import { useState, useEffect } from 'react'
import { createProject } from '@/lib/actions/projects'
import { X, MapPin, Globe, Mountain, Building2, Trees } from 'lucide-react'
import { Project } from '@/types/project'
import { Country, State, City } from 'country-state-city'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  onProjectAdded?: (project: Project) => void
  onProjectView?: (project: Project) => void  // Add this prop for viewing
}

export default function AddProjectModal({ 
  isOpen, 
  onClose, 
  customerId,
  onProjectAdded,
  onProjectView  // New prop
}: AddProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [animateIn, setAnimateIn] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    acres: '',
    country: 'IN',
    state: '',
    district: '',
    city: '',
    village: '',
    status: 'active'
  })

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  // Load all countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country)
      setStates(countryStates)
      setFormData(prev => ({ ...prev, state: '', city: '' }))
      setCities([])
    } else {
      setStates([])
      setCities([])
    }
  }, [formData.country])

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state)
      setCities(stateCities)
      setFormData(prev => ({ ...prev, city: '' }))
    } else {
      setCities([])
    }
  }, [formData.state, formData.country])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedCountry = countries.find(c => c.isoCode === formData.country)
      const selectedState = states.find(s => s.isoCode === formData.state)
      
      const projectData = {
        customer_id: customerId,
        name: formData.name,
        acres: parseFloat(formData.acres) || null,
        country: selectedCountry?.name || formData.country,
        state: selectedState?.name || formData.state,
        district: formData.district || null,
        city: formData.city || null,
        village: formData.village || null,
        status: formData.status
      }

      const result = await createProject(projectData)
      
      if (result.error) {
        console.error('Error creating project:', result.error)
        return
      }

      if (result.project) {
        // First notify that project was added (to refresh the list)
        if (onProjectAdded) {
          onProjectAdded(result.project)
        }
        
        // Close this modal
        handleClose()
        
        // Then open the project view modal with a slight delay for better UX
        setTimeout(() => {
          if (onProjectView) {
            onProjectView(result.project)
          }
        }, 300)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(() => {
      onClose()
      resetForm()
    }, 200)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      acres: '',
      country: 'IN',
      state: '',
      district: '',
      city: '',
      village: '',
      status: 'active'
    })
    setCities([])
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-lg transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated gradient background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B88D2B] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
        
        {/* Modal content */}
        <div className="relative bg-gradient-to-br from-[#0F1A0F] to-[#1E2E1E] border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          
          {/* Header with subtle pattern */}
          <div className="relative px-5 py-4 border-b border-[#D4AF37]/20 bg-[#0A150A]">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }}></div>
            
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-white">New Project</h2>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Project Name & Acres row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Project Name <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                  placeholder="e.g., Spring Crop"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Acres <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.acres}
                  onChange={(e) => setFormData({ ...formData, acres: e.target.value })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Status & Country row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Status <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.2em'
                  }}
                >
                  <option value="active" className="bg-[#0F1A0F]">Active</option>
                  <option value="completed" className="bg-[#0F1A0F]">Completed</option>
                  <option value="planned" className="bg-[#0F1A0F]">Planned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Country <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-6 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2em'
                    }}
                  >
                    {countries.map(country => (
                      <option key={country.isoCode} value={country.isoCode} className="bg-[#0F1A0F]">
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* State & District row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  State <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Mountain className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    disabled={!formData.country}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-6 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2em'
                    }}
                  >
                    <option value="" className="bg-[#0F1A0F]">Select State</option>
                    {states.map(state => (
                      <option key={state.isoCode} value={state.isoCode} className="bg-[#0F1A0F]">
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* City & Village row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  City/Town
                </label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!formData.state}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-6 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2em'
                    }}
                  >
                    <option value="" className="bg-[#0F1A0F]">Optional</option>
                    {cities.map(city => (
                      <option key={`${city.name}-${city.countryCode}-${city.stateCode}`} value={city.name} className="bg-[#0F1A0F]">
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Village
                </label>
                <div className="relative">
                  <Trees className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#D4AF37]/10">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800/50 transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-1.5 text-xs font-medium bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-[#0A100A] border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}