'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Project } from '@/types/project'
import { Plot } from '@/types/plot'
import { 
  X, Edit2, Trash2, Save, Plus, Ruler, MapPin, Calendar, 
  DollarSign, Users, Truck, Coffee, Tractor, Droplets, 
  Sprout, Wallet, Leaf, ChevronDown, ChevronUp, 
  TrendingUp, TrendingDown, FileText, Globe, Mountain, Building2, Trees, Hash, Search
} from 'lucide-react'
import { deleteProject, updateProject } from '@/lib/actions/projects'
import { getPlotsByProject, deletePlot } from '@/lib/actions/plots'
import { Country, State, City } from 'country-state-city'
import AddPlotModal from './AddPlotModal'
import PlotTransactionsView from './PlotTransactionsView'

interface ProjectZoomViewProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onUpdate?: (updatedProject?: Project) => void
  onDelete?: (projectId: string) => Promise<void>
}

export default function ProjectZoomView({ 
  isOpen, onClose, project, onUpdate, onDelete 
}: ProjectZoomViewProps) {
  // --- State ---
  const [localProject, setLocalProject] = useState<Project | null>(project)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [isUpdatingProject, setIsUpdatingProject] = useState(false)
  const [editedProject, setEditedProject] = useState<Partial<Project>>({})
  const [plots, setPlots] = useState<Plot[]>([])
  const [isLoadingPlots, setIsLoadingPlots] = useState(false)
  const [showAddPlotModal, setShowAddPlotModal] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [showPlotTransactions, setShowPlotTransactions] = useState(false)
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null)
  const [showEditPlotModal, setShowEditPlotModal] = useState(false)
  const [selectedPlotType, setSelectedPlotType] = useState<'plot' | 'acre'>('plot')
  const [plotSearchTerm, setPlotSearchTerm] = useState('')
  const [plotTypeFilter, setPlotTypeFilter] = useState<'all' | 'plot' | 'acre'>('all')
  
  // Ref to track if we just updated to prevent overwrite
  const justUpdatedRef = useRef(false)

  const [countries] = useState(Country.getAllCountries())
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

  // Filter plots based on search and type
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      if (plotTypeFilter !== 'all' && plot.type !== plotTypeFilter) return false
      if (plotSearchTerm) {
        const searchLower = plotSearchTerm.toLowerCase()
        if (plot.type === 'plot') {
          return plot.plot_number?.toLowerCase().includes(searchLower)
        } else {
          return plot.acre_number?.toLowerCase().includes(searchLower)
        }
      }
      return true
    })
  }, [plots, plotSearchTerm, plotTypeFilter])

  // Load plots when project opens
  useEffect(() => {
    if (project) {
      // Only reset localProject if we're not in the middle of an update
      if (!justUpdatedRef.current) {
        setLocalProject(project)
        setEditedProject(project)
      }
      loadPlots()
      // Load location data for editing
      if (project.country) {
        const countryCode = countries.find(c => c.name === project.country)?.isoCode || 'IN'
        const countryStates = State.getStatesOfCountry(countryCode)
        setStates(countryStates)
        if (project.state) {
          const stateCode = countryStates.find(s => s.name === project.state)?.isoCode
          if (stateCode) {
            const stateCities = City.getCitiesOfState(countryCode, stateCode)
            setCities(stateCities)
          }
        }
      }
    }
  }, [project])

  const loadPlots = async () => {
    if (!localProject) return
    setIsLoadingPlots(true)
    try {
      const data = await getPlotsByProject(localProject.id)
      setPlots(data)
    } catch (error) {
      console.error('Failed to load plots:', error)
    } finally {
      setIsLoadingPlots(false)
    }
  }

  // --- Handlers ---
  const handleUpdateProject = async () => {
    if (!localProject || !editedProject) return
    
    setIsUpdatingProject(true)
    try {
      const projectData: any = {}
      
      if (editedProject.name !== undefined) projectData.name = editedProject.name
      if (editedProject.status !== undefined) projectData.status = editedProject.status
      if (editedProject.country !== undefined) projectData.country = editedProject.country
      if (editedProject.state !== undefined) projectData.state = editedProject.state
      if (editedProject.district !== undefined) projectData.district = editedProject.district
      if (editedProject.city !== undefined) projectData.city = editedProject.city
      if (editedProject.village !== undefined) projectData.village = editedProject.village
      
      if (Object.keys(projectData).length === 0) {
        setIsEditing(false)
        setIsUpdatingProject(false)
        return
      }
      
      const result = await updateProject(localProject.id, projectData)
      if (result.error) {
        console.error('Failed to update project:', result.error)
        return
      }
      
      // Mark that we just updated to prevent useEffect from overwriting
      justUpdatedRef.current = true
      
      // Create the updated project object
      let updatedProjectData: Project
      if (result.project) {
        updatedProjectData = result.project
      } else {
        updatedProjectData = { ...localProject, ...projectData } as Project
      }
      
      // Update local project state with the new data for instant UI update
      setLocalProject(updatedProjectData)
      setEditedProject(updatedProjectData)
      
      setIsEditing(false)
      
      // Pass the updated project to parent so it can update its list
      if (onUpdate) {
        onUpdate(updatedProjectData)
      }
      
      // Reset the flag after a short delay
      setTimeout(() => {
        justUpdatedRef.current = false
      }, 500)
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsUpdatingProject(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!localProject) return
    setIsDeletingProject(true)
    try {
      const result = await deleteProject(localProject.id)
      if (result.error) {
        console.error('Failed to delete project:', result.error)
        return
      }
      setShowDeleteConfirm(false)
      onClose()
      if (onDelete) await onDelete(localProject.id)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeletingProject(false)
    }
  }

  const handleDeletePlot = async (plotId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this plot? All transactions will be lost.')) return
    try {
      await deletePlot(plotId)
      loadPlots()
    } catch (error) {
      console.error('Error deleting plot:', error)
    }
  }

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot)
    setShowPlotTransactions(true)
  }

  const handleEditPlot = (plot: Plot, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingPlot(plot)
    setShowEditPlotModal(true)
  }

  const handleAddPlot = (type: 'plot' | 'acre') => {
    setSelectedPlotType(type)
    setShowAddPlotModal(true)
  }

  // --- Early return if not open ---
  if (!isOpen || !localProject) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Main Modal */}
      <div className="relative w-full max-w-6xl h-[98vh] sm:h-[95vh] md:h-[90vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 truncate">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] flex-shrink-0" />
              <span className="truncate">{localProject.name}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-1.5 sm:p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors group"
              title="Edit Farm Details"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
              title="Delete Farm"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 sm:p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors ml-1 sm:ml-2"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Delete Project Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute top-16 sm:top-20 right-2 sm:right-6 left-2 sm:left-auto z-20 bg-[#1A1F1A] border border-red-500/30 rounded-xl p-4 sm:p-6 shadow-2xl w-auto sm:w-80 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Delete Farm?</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">This action cannot be undone. All plots and transactions will be lost.</p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-300 hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProject} 
                disabled={isDeletingProject} 
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {isDeletingProject ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* --- Content Area --- */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">

          {/* EDIT MODE - Only shows when editing */}
          {isEditing && (
            <div className="bg-gradient-to-br from-black/40 to-black/20 border border-[#D4AF37]/20 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-md font-semibold text-[#D4AF37] flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Farm Details
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdateProject} 
                    disabled={isUpdatingProject}
                    className="px-3 py-1.5 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-colors text-xs disabled:opacity-50"
                  >
                    {isUpdatingProject ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditedProject(localProject); }} 
                    className="px-3 py-1.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Farm Name <span className="text-[#D4AF37]">*</span></label>
                  <input
                    type="text"
                    value={editedProject.name || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Enter farm name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={editedProject.status || 'active'}
                    onChange={(e) => {
                      const status = e.target.value as "active" | "completed" | "on hold"
                      setEditedProject({ ...editedProject, status })
                    }}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={editedProject.country || 'India'}
                    onChange={(e) => setEditedProject({ ...editedProject, country: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    value={editedProject.state || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, state: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">District</label>
                  <input
                    type="text"
                    value={editedProject.district || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, district: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editedProject.city || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, city: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Village</label>
                  <input
                    type="text"
                    value={editedProject.village || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, village: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PLOTS SECTION */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 sm:h-5 bg-[#D4AF37] rounded-full"></span>
                Plots & Acres
                <span className="text-xs text-gray-400">({filteredPlots.length} total)</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddPlot('plot')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-all text-xs font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Plot
                </button>
                <button
                  onClick={() => handleAddPlot('acre')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-all text-xs font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Acre
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by plot/acre number..."
                  value={plotSearchTerm}
                  onChange={(e) => setPlotSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/40 border border-[#D4AF37]/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPlotTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    plotTypeFilter === 'all'
                      ? 'bg-[#D4AF37] text-[#0A100A]'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPlotTypeFilter('plot')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    plotTypeFilter === 'plot'
                      ? 'bg-[#D4AF37] text-[#0A100A]'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30'
                  }`}
                >
                  Plots
                </button>
                <button
                  onClick={() => setPlotTypeFilter('acre')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    plotTypeFilter === 'acre'
                      ? 'bg-[#D4AF37] text-[#0A100A]'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30'
                  }`}
                >
                  Acres
                </button>
              </div>
            </div>

            {isLoadingPlots ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : filteredPlots.length === 0 ? (
              <div className="text-center py-8 bg-black/20 border border-[#D4AF37]/10 rounded-xl">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">
                  {plots.length === 0 
                    ? 'No plots or acres yet.' 
                    : 'No matches found for your search.'}
                </p>
                {plots.length === 0 && (
                  <p className="text-sm text-gray-600 mt-1">Add your first plot or acre using the buttons above.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPlots.map(plot => (
                  <div
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className="bg-gradient-to-br from-black/40 to-black/20 border border-[#D4AF37]/20 rounded-xl p-4 cursor-pointer hover:border-[#D4AF37] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white font-medium">
                          {plot.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditPlot(plot, e)}
                          className="p-1 hover:bg-[#D4AF37]/20 rounded text-gray-400 hover:text-[#D4AF37]"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePlot(plot.id, e)}
                          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {plot.type === 'plot' && plot.cent && (
                      <p className="text-xs text-gray-400">Cent: {plot.cent}</p>
                    )}
                    {plot.type === 'acre' && plot.acre && (
                      <p className="text-xs text-gray-400">Acre: {plot.acre}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Click to view transactions</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Plot Modal */}
      {showAddPlotModal && (
        <AddPlotModal
          isOpen={showAddPlotModal}
          onClose={() => setShowAddPlotModal(false)}
          projectId={localProject.id}
          type={selectedPlotType}
          onPlotAdded={loadPlots}
        />
      )}

      {/* Edit Plot Modal */}
      {showEditPlotModal && editingPlot && (
        <AddPlotModal
          isOpen={showEditPlotModal}
          onClose={() => {
            setShowEditPlotModal(false)
            setEditingPlot(null)
          }}
          projectId={localProject.id}
          type={editingPlot.type}
          onPlotAdded={loadPlots}
          editingPlot={editingPlot}
        />
      )}

      {/* Plot Transactions Modal */}
      {selectedPlot && showPlotTransactions && (
        <PlotTransactionsView
          isOpen={showPlotTransactions}
          onClose={() => {
            setShowPlotTransactions(false)
            setSelectedPlot(null)
          }}
          plot={selectedPlot}
          onTransactionUpdate={() => {
            loadPlots()
          }}
        />
      )}
    </div>
  )
}