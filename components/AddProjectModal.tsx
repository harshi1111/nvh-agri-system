'use client'

import { useState, useEffect } from 'react'
import { createProject } from '@/lib/actions/projects'
import { createPlot } from '@/lib/actions/plots'  
import { X, MapPin, Globe, Mountain, Building2, Trees, Hash, Ruler, Loader2 } from 'lucide-react'
import { Project } from '@/types/project'
import { Country, State, City } from 'country-state-city'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: string
  onProjectAdded?: (project: Project) => void
  onProjectView?: (project: Project) => void
}

export default function AddProjectModal({ 
  isOpen, 
  onClose, 
  customerId,
  onProjectAdded,
  onProjectView
}: AddProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [animateIn, setAnimateIn] = useState(false)
  const [isFetchingPincode, setIsFetchingPincode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    farmName: '',
    type: 'plot' as 'plot' | 'acre',
    plotNumber: '',
    cent: '',
    acreNumber: '',
    acre: '',
    pincode: '',
    country: 'IN',
    state: '',
    district: '',
    city: '',
    village: '',
    status: 'active'
  })

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

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

  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state)
      setCities(stateCities)
      setFormData(prev => ({ ...prev, city: '' }))
    } else {
      setCities([])
    }
  }, [formData.state, formData.country])

  const fetchPincodeDetails = async (pincode: string) => {
    if (pincode.length !== 6) return
    setIsFetchingPincode(true)
    setError(null)
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      const data = await response.json()
      if (data[0]?.Status === 'Success') {
        const postOffice = data[0].PostOffice[0]
        const district = postOffice.District
        const state = postOffice.State
        const country = 'IN'

        const stateObj = State.getStatesOfCountry('IN').find(s => s.name === state)
        const stateCode = stateObj?.isoCode || ''

        setFormData(prev => ({
          ...prev,
          country: 'IN',
          state: stateCode,
          district: district,
          city: postOffice.Name || '',
          village: postOffice.Name || ''
        }))
      }
    } catch (error) {
      console.error('Error fetching pincode:', error)
      setError('Could not fetch pincode details')
    } finally {
      setIsFetchingPincode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const selectedCountry = countries.find(c => c.isoCode === formData.country)
      const selectedState = states.find(s => s.isoCode === formData.state)
      
      const stateName = selectedState?.name || ''
      const cityName = formData.city || ''
      
      // Debug log
      console.log('Form data before submit:', {
        farmName: formData.farmName,
        stateName,
        cityName,
        selectedState: selectedState,
        formDataCity: formData.city
      })
      
      if (!formData.farmName) {
        setError('Farm name is required')
        setIsLoading(false)
        return
      }
      
      if (!stateName) {
        setError('Please select a state')
        setIsLoading(false)
        return
      }
      
      if (!cityName) {
        setError('Please select a city')
        setIsLoading(false)
        return
      }
      
      // 1. Create project
      const projectData = {
        customer_id: customerId,
        name: formData.farmName,
        type: formData.type,
        acres: null,
        country: selectedCountry?.name || 'India',
        state: stateName,
        district: formData.district || '',
        city: cityName,
        village: formData.village || '',
        status: 'active'
      }

      console.log('Submitting project data:', projectData)

      const projectResult = await createProject(projectData)
      
      if (projectResult.error) {
        setError(projectResult.error)
        console.error('Error creating project:', projectResult.error)
        setIsLoading(false)
        return
      }

      const project = projectResult.project!

      // 2. Create first plot based on type
      if (formData.type === 'plot') {
        await createPlot({
          project_id: project.id,
          type: 'plot',
          plot_number: formData.plotNumber || null,
          cent: formData.cent ? parseFloat(formData.cent) : null,
          acre_number: null,
          acre: null
        })
      } else {
        await createPlot({
          project_id: project.id,
          type: 'acre',
          plot_number: null,
          cent: null,
          acre_number: formData.acreNumber || null,
          acre: formData.acre ? parseFloat(formData.acre) : null
        })
      }

      // Notify parent
      if (onProjectAdded) {
        onProjectAdded(project)
      }

      // Close modal
      handleClose()

      // Open project view
      setTimeout(() => {
        if (onProjectView) {
          onProjectView(project)
        }
      }, 300)
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred')
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
      farmName: '',
      type: 'plot',
      plotNumber: '',
      cent: '',
      acreNumber: '',
      acre: '',
      pincode: '',
      country: 'IN',
      state: '',
      district: '',
      city: '',
      village: '',
      status: 'active'
    })
    setCities([])
    setError(null)
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B88D2B] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
        
        <div className="relative bg-gradient-to-br from-[#0F1A0F] to-[#1E2E1E] border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          
          <div className="relative px-5 py-4 border-b border-[#D4AF37]/20 bg-[#0A150A]">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`,
              backgroundSize: '16px 16px'
            }}></div>
            
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-white">Add New Farm</h2>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-all hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Farm Name & Type row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Farm Name <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                  placeholder="e.g., North Field"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Type <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'plot' | 'acre' })}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all appearance-none cursor-pointer"
                >
                  <option value="plot">Plot</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
            </div>

            {/* Conditional fields based on type */}
            {formData.type === 'plot' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Plot No <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plotNumber}
                    onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                    placeholder="e.g., 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Cent
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cent}
                    onChange={(e) => setFormData({ ...formData, cent: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Acre No <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.acreNumber}
                    onChange={(e) => setFormData({ ...formData, acreNumber: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                    placeholder="e.g., A-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Acre
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.acre}
                    onChange={(e) => setFormData({ ...formData, acre: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            )}

            {/* Pincode */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Pincode
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, pincode: val })
                    if (val.length === 6) fetchPincodeDetails(val)
                  }}
                  className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all"
                  placeholder="Enter 6-digit pincode"
                />
                {isFetchingPincode && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] animate-spin" />
                )}
              </div>
            </div>

            {/* Location fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-6 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all appearance-none cursor-pointer"
                  >
                    {countries.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  City/Town <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!formData.state}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg pl-8 pr-6 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={`${city.name}-${city.countryCode}-${city.stateCode}`} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    <span>Create Farm</span>
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