'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { 
  X, Edit2, Trash2, Save, Plus, Ruler, MapPin, Calendar, 
  DollarSign, Users, Truck, Coffee, Tractor, Droplets, 
  Sprout, Wallet, Leaf, ChevronDown, ChevronUp, 
  TrendingUp, TrendingDown, FileText, Archive, Globe, Mountain, Building2, Trees
} from 'lucide-react'
import { createTransaction, getTransactionsByProject, updateTransaction, deleteTransaction } from '@/lib/actions/transactions'
import { deleteProject, updateProject } from '@/lib/actions/projects'
import { Country, State, City } from 'country-state-city'

// --- Type Definitions ---
interface Transaction {
  id: string
  serial_no: number
  date: string
  type: 'labour' | 'transport' | 'food' | 'ploughing' | 'tractor' | 'dung' | 'sprinkler' | 'investment'
  count?: number | null
  amount: number
  description: string
}

interface ProjectZoomViewProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onUpdate?: () => void
  onDelete?: (projectId: string) => Promise<void>
}

// Transaction type configuration for the UI
const transactionTypes = [
  { id: 'labour', label: 'Labour', icon: Users, color: 'blue', placeholder: 'e.g., 5 workers', gradient: 'from-blue-500/20 to-blue-600/5' },
  { id: 'transport', label: 'Transport', icon: Truck, color: 'orange', placeholder: 'e.g., Tractor hire', gradient: 'from-orange-500/20 to-orange-600/5' },
  { id: 'food', label: 'Food', icon: Coffee, color: 'yellow', placeholder: 'e.g., Worker meals', gradient: 'from-yellow-500/20 to-yellow-600/5' },
  { id: 'ploughing', label: 'Ploughing', icon: Tractor, color: 'green', placeholder: 'e.g., Field prep', gradient: 'from-green-500/20 to-green-600/5' },
  { id: 'tractor', label: 'Tractor', icon: Tractor, color: 'emerald', placeholder: 'e.g., Harrowing', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  { id: 'dung', label: 'Cow Dung', icon: Droplets, color: 'amber', placeholder: 'e.g., Organic manure', gradient: 'from-amber-700/20 to-amber-800/5' },
  { id: 'sprinkler', label: 'Sprinkler', icon: Sprout, color: 'cyan', placeholder: 'e.g., 10 units', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  { id: 'investment', label: 'Investment', icon: Wallet, color: 'purple', placeholder: 'e.g., Capital', gradient: 'from-purple-500/20 to-purple-600/5' },
]

export default function ProjectZoomView({ 
  isOpen, onClose, project, onUpdate, onDelete 
}: ProjectZoomViewProps) {
  // --- State ---
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [isUpdatingProject, setIsUpdatingProject] = useState(false)
  const [editedProject, setEditedProject] = useState<Partial<Project>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMobileRow, setExpandedMobileRow] = useState<string | null>(null)
  const [countries] = useState(Country.getAllCountries())
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'labour',
    amount: undefined,
    count: null,
    description: ''
  })

  // --- Load transactions when project opens ---
  useEffect(() => {
    if (project) {
      setEditedProject(project)
      loadTransactions()
      // Load states for the project's country
      if (project.country) {
        const countryCode = countries.find(c => c.name === project.country)?.isoCode || 'IN'
        const countryStates = State.getStatesOfCountry(countryCode)
        setStates(countryStates)
        
        // Load cities if state exists
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

  const loadTransactions = async () => {
    if (!project) return
    setIsLoading(true)
    try {
      const data = await getTransactionsByProject(project.id)
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // --- Calculations ---
  const totalDebit = transactions
    .filter(t => t.type !== 'investment')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalCredit = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalCredit - totalDebit

  // --- Handlers ---
  const handleUpdateProject = async () => {
    if (!project || !editedProject) return
    
    setIsUpdatingProject(true)
    try {
      // FIXED: Only include fields that exist in the Project type
      const projectData = {
        name: editedProject.name,
        acres: editedProject.acres,
        country: editedProject.country,
        state: editedProject.state || '',  // Convert null/undefined to empty string
        district: editedProject.district || '',  // Convert null/undefined to empty string
        village: editedProject.village || '',  // Convert null/undefined to empty string
        status: editedProject.status,
      }
      
      const result = await updateProject(project.id, projectData)
      if (result.error) {
        console.error('Failed to update project:', result.error)
        return
      }
      setIsEditing(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsUpdatingProject(false)
    }
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.type || !newTransaction.date || !project) return
    // Default to 0 if amount is undefined or empty
    const amount = newTransaction.amount ?? 0

    setIsLoading(true)
    try {
      const result = await createTransaction(project.id, {
        project_id: project.id,
        date: newTransaction.date,
        type: newTransaction.type as any,
        amount,
        description: newTransaction.description || '',
        count: newTransaction.count || null,
      })

      if (result.error) {
        console.error('Failed to add transaction:', result.error)
        return
      }

      await loadTransactions()
      resetForm()
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !project) return

    setIsLoading(true)
    try {
      const result = await updateTransaction(editingTransaction.id, {
        date: editingTransaction.date,
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        count: editingTransaction.count,
      })

      if (result.error) {
        console.error('Failed to update transaction:', result.error)
        return
      }

      await loadTransactions()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error updating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!project) return

    setIsLoading(true)
    try {
      const result = await deleteTransaction(id)
      if (result.error) {
        console.error('Failed to delete transaction:', result.error)
        return
      }

      await loadTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    
    setIsDeletingProject(true)
    try {
      const result = await deleteProject(project.id)
      if (result.error) {
        console.error('Failed to delete project:', result.error)
        return
      }
      setShowDeleteConfirm(false)
      onClose()
      if (onDelete) {
        await onDelete(project.id)
      }
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeletingProject(false)
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingTransaction(null)
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'labour',
      amount: undefined,
      count: null,
      description: ''
    })
  }

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setShowAddForm(false)
    setExpandedMobileRow(null)
  }

  // --- Early return if not open ---
  if (!isOpen || !project) return null

  // --- Helper Functions ---
  const getTypeIcon = (type: string, className = "w-4 h-4") => {
    const config = transactionTypes.find(t => t.id === type)
    const Icon = config?.icon || DollarSign
    return <Icon className={className} />
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      labour: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      transport: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      food: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ploughing: 'bg-green-500/20 text-green-400 border-green-500/30',
      tractor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      dung: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
      sprinkler: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      investment: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getTypeGradient = (type: string) => {
    const config = transactionTypes.find(t => t.id === type)
    return config?.gradient || 'from-gray-500/20 to-gray-600/5'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Main Modal */}
      <div className="relative w-full max-w-6xl h-[98vh] sm:h-[95vh] md:h-[90vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-sm">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedProject.name || ''}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                className="text-xl sm:text-2xl font-bold bg-transparent border-b-2 border-[#D4AF37] text-white px-2 py-1 focus:outline-none w-full max-w-md"
                placeholder="Project Name"
              />
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 truncate">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] flex-shrink-0" />
                <span className="truncate">{project.name}</span>
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-1.5 sm:p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors group"
                  title="Edit Project Details"
                >
                  <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleUpdateProject} 
                  disabled={isUpdatingProject}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50"
                >
                  {isUpdatingProject ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[#0A100A] border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" /> 
                      <span className="hidden xs:inline">Save</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setEditedProject(project); }} 
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </>
            )}
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
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Delete Project?</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">This action cannot be undone. All transactions will be lost.</p>
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

          {/* PROJECT DETAILS SECTION */}
          <div className="bg-gradient-to-br from-black/40 to-black/20 border border-[#D4AF37]/20 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
            <h3 className="text-sm sm:text-md font-semibold text-[#D4AF37] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Project Details
            </h3>
            
            {isEditing ? (
              // Edit Mode
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Acres</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedProject.acres || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, acres: parseFloat(e.target.value) || null })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={editedProject.status || 'active'}
                    onChange={(e) => {
                      // FIXED: Cast the value to the expected type
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
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editedProject.city || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, city: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Village</label>
                  <input
                    type="text"
                    value={editedProject.village || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, village: e.target.value })}
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    <Ruler className="w-3 h-3" />
                    <span className="text-xs">Acres</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{project.acres || 'N/A'}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    <Globe className="w-3 h-3" />
                    <span className="text-xs">Country</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{project.country || 'India'}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    <Mountain className="w-3 h-3" />
                    <span className="text-xs">State</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{project.state || 'N/A'}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    <Building2 className="w-3 h-3" />
                    <span className="text-xs">District</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{project.district || 'N/A'}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-[#D4AF37]/10">
                  <div className="flex items-center gap-1 text-[#D4AF37] mb-1">
                    <Trees className="w-3 h-3" />
                    <span className="text-xs">Village/City</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {[project.village, project.city].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FINANCIAL SUMMARY SECTION */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
            {/* Debit Card */}
            <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-400" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400">Debit</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 truncate">
                ₹{totalDebit.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Money spent</div>
            </div>

            {/* Credit Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400">Credit</span>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 truncate">
                ₹{totalCredit.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Investments</div>
            </div>

            {/* Balance Card */}
            <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="p-1.5 sm:p-2 bg-[#D4AF37]/10 rounded-lg">
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400">Net Balance</span>
                </div>
                <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${
                  balance >= 0 
                    ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {balance >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>
              <div className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 ${
                balance >= 0 ? 'text-green-400' : 'text-red-400'
              } truncate`}>
                ₹{Math.abs(balance).toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Credit - Debit</div>
            </div>
          </div>

          {/* TRANSACTIONS SECTION */}
          <div className="space-y-3 sm:space-y-4">
            {/* Section Header with Add Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-4 sm:h-5 bg-[#D4AF37] rounded-full"></span>
                Transaction Ledger
              </h3>
              {!showAddForm && !editingTransaction && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  disabled={isLoading}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  <span className="hidden xs:inline">Add Entry</span>
                  <span className="xs:hidden">Add</span>
                </button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && !showAddForm && (
              <div className="flex justify-center items-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#D4AF37]"></div>
              </div>
            )}

            {/* Add/Edit Form */}
            {(showAddForm || editingTransaction) && (
              <div className="bg-gradient-to-br from-black/60 to-black/40 border border-[#D4AF37]/20 rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm">
                <h4 className="text-sm sm:text-md font-medium text-[#D4AF37] mb-3 sm:mb-4">
                  {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Date */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={editingTransaction?.date || newTransaction.date}
                        onChange={(e) => editingTransaction 
                          ? setEditingTransaction({ ...editingTransaction, date: e.target.value })
                          : setNewTransaction({ ...newTransaction, date: e.target.value })
                        }
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    
                    {/* Type */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Type</label>
                      <select
                        value={editingTransaction?.type || newTransaction.type}
                        onChange={(e) => {
                          const val = e.target.value as any
                          editingTransaction
                            ? setEditingTransaction({ ...editingTransaction, type: val, count: null })
                            : setNewTransaction({ ...newTransaction, type: val, count: null })
                        }}
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        {transactionTypes.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Count (only if applicable) */}
                    {(!editingTransaction && (newTransaction.type === 'labour' || newTransaction.type === 'tractor' || newTransaction.type === 'sprinkler')) && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Count</label>
                        <input
                          type="number"
                          value={newTransaction.count ?? ''}
                          onChange={(e) => setNewTransaction({ ...newTransaction, count: e.target.value === '' ? null : parseInt(e.target.value) })}
                          placeholder={newTransaction.type === 'labour' ? 'Workers' : 'Units'}
                          className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}
                    
                    {editingTransaction && (editingTransaction.type === 'labour' || editingTransaction.type === 'tractor' || editingTransaction.type === 'sprinkler') && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Count</label>
                        <input
                          type="number"
                          value={editingTransaction.count ?? ''}
                          onChange={(e) => setEditingTransaction({ ...editingTransaction, count: e.target.value === '' ? null : parseInt(e.target.value) })}
                          className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    )}

                    {/* Amount – now starts empty */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={editingTransaction?.amount ?? newTransaction.amount ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                          if (editingTransaction) {
                            setEditingTransaction({ ...editingTransaction, amount: val === undefined ? 0 : val })
                          } else {
                            setNewTransaction({ ...newTransaction, amount: val })
                          }
                        }}
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                        placeholder="Enter amount"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <input
                        type="text"
                        value={editingTransaction?.description || newTransaction.description}
                        onChange={(e) => editingTransaction
                          ? setEditingTransaction({ ...editingTransaction, description: e.target.value })
                          : setNewTransaction({ ...newTransaction, description: e.target.value })
                        }
                        placeholder={transactionTypes.find(t => t.id === (editingTransaction?.type || newTransaction.type))?.placeholder}
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <button 
                      onClick={resetForm} 
                      className="w-full sm:w-auto px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : (editingTransaction ? 'Update' : 'Add Transaction')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            {transactions.length === 0 && !isLoading ? (
              <div className="text-center py-8 sm:py-12 bg-black/20 border border-[#D4AF37]/10 rounded-xl">
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500">No transactions yet.</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Add your first entry using the button above.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto border border-[#D4AF37]/20 rounded-xl backdrop-blur-sm">
                  <table className="w-full">
                    <thead className="bg-black/40">
                      <tr className="text-xs text-gray-400">
                        <th className="text-left py-3 px-4 font-medium">S.No</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-left py-3 px-4 font-medium">Count</th>
                        <th className="text-right py-3 px-4 font-medium">Debit (₹)</th>
                        <th className="text-right py-3 px-4 font-medium">Credit (₹)</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.sort((a,b) => a.serial_no - b.serial_no).map((t) => (
                        <tr key={t.id} className="border-t border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 text-sm">
                          <td className="py-3 px-4 text-white font-mono">{t.serial_no}</td>
                          <td className="py-3 px-4 text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit border ${getTypeColor(t.type)}`}>
                              {getTypeIcon(t.type)}
                              <span className="capitalize">{t.type}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300 max-w-xs">
                            <div className="line-clamp-1">{t.description || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {t.count ? `${t.count} ${t.type === 'labour' ? 'workers' : 'units'}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-red-400">
                            {t.type !== 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-green-400">
                            {t.type === 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => startEdit(t)} 
                                disabled={isLoading}
                                className="p-1 hover:bg-[#D4AF37]/20 rounded text-gray-400 hover:text-[#D4AF37] disabled:opacity-50"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTransaction(t.id)} 
                                disabled={isLoading}
                                className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {transactions.sort((a,b) => a.serial_no - b.serial_no).map((t) => (
                    <div 
                      key={t.id} 
                      className={`bg-gradient-to-br ${getTypeGradient(t.type)} border border-[#D4AF37]/10 rounded-xl overflow-hidden`}
                    >
                      {/* Card Header */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(t.type)}`}>
                            {getTypeIcon(t.type, "w-4 h-4")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">#{t.serial_no}</span>
                              <span className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</span>
                            </div>
                            <span className="text-sm font-medium text-white capitalize">{t.type}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedMobileRow(expandedMobileRow === t.id ? null : t.id)}
                          className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg"
                        >
                          {expandedMobileRow === t.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Quick Amount Preview */}
                      <div className="px-3 pb-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Amount:</span>
                        <span className={`text-sm font-bold ${
                          t.type === 'investment' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {t.type === 'investment' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {expandedMobileRow === t.id && (
                        <div className="px-3 pb-3 space-y-2 border-t border-[#D4AF37]/10 pt-2">
                          {t.description && (
                            <div>
                              <span className="text-xs text-gray-500 block">Description:</span>
                              <span className="text-sm text-gray-300">{t.description}</span>
                            </div>
                          )}
                          {t.count && (
                            <div>
                              <span className="text-xs text-gray-500 block">Count:</span>
                              <span className="text-sm text-gray-300">
                                {t.count} {t.type === 'labour' ? 'workers' : 'units'}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => startEdit(t)}
                              className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-2 bg-red-500/10 rounded-lg text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}