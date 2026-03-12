'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { 
  X, Edit2, Trash2, Save, Plus, Ruler, MapPin, Calendar, 
  DollarSign, Users, Truck, Coffee, Tractor, Droplets, 
  Sprout, Wallet, Leaf, MoreHorizontal
} from 'lucide-react'

// --- Type Definitions ---
interface Transaction {
  id: string
  serial_no: number
  date: string
  type: 'labour' | 'transport' | 'food' | 'ploughing' | 'tractor' | 'dung' | 'sprinkler' | 'investment'
  count?: number | null // For labour, tractor, sprinkler count
  amount: number // The transaction amount
  description: string
  // Type is determined by the 'type' field
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
  { id: 'labour', label: 'Labour', icon: Users, color: 'blue', placeholder: 'e.g., 5 workers' },
  { id: 'transport', label: 'Transport', icon: Truck, color: 'orange', placeholder: 'e.g., Tractor hire' },
  { id: 'food', label: 'Food', icon: Coffee, color: 'yellow', placeholder: 'e.g., Worker meals' },
  { id: 'ploughing', label: 'Ploughing', icon: Tractor, color: 'green', placeholder: 'e.g., Field prep' },
  { id: 'tractor', label: 'Tractor', icon: Tractor, color: 'emerald', placeholder: 'e.g., Harrowing' },
  { id: 'dung', label: 'Cow Dung', icon: Droplets, color: 'amber', placeholder: 'e.g., Organic manure' },
  { id: 'sprinkler', label: 'Sprinkler', icon: Sprout, color: 'cyan', placeholder: 'e.g., 10 units' },
  { id: 'investment', label: 'Investment', icon: Wallet, color: 'purple', placeholder: 'e.g., Capital' },
]

export default function ProjectZoomView({ 
  isOpen, onClose, project, onUpdate, onDelete 
}: ProjectZoomViewProps) {
  // --- State ---
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [editedProject, setEditedProject] = useState<Partial<Project>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'labour',
    amount: 0,
    count: null,
    description: ''
  })

  // --- Effects ---
  useEffect(() => {
    if (project) setEditedProject(project)
  }, [project])

  // --- Calculations ---
  const totalDebit = transactions
    .filter(t => t.type !== 'investment')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalCredit = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalCredit - totalDebit

  // --- Handlers ---
  const handleAddTransaction = () => {
    if (!newTransaction.type || !newTransaction.date || !newTransaction.amount) return

    const newId = Date.now().toString()
    const newSerial = transactions.length + 1

    const transaction: Transaction = {
      id: newId,
      serial_no: newSerial,
      date: newTransaction.date,
      type: newTransaction.type as any,
      amount: newTransaction.amount,
      description: newTransaction.description || '',
      count: newTransaction.count || null,
    }

    setTransactions([...transactions, transaction])
    resetForm()
  }

  const handleUpdateTransaction = () => {
    if (!editingTransaction) return
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? editingTransaction : t
    ))
    setEditingTransaction(null)
  }

  const handleDeleteTransaction = (id: string) => {
    const filtered = transactions.filter(t => t.id !== id)
    const renumbered = filtered.map((t, index) => ({ ...t, serial_no: index + 1 }))
    setTransactions(renumbered)
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingTransaction(null)
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'labour',
      amount: 0,
      count: null,
      description: ''
    })
  }

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setShowAddForm(false)
  }

  // --- Early return if not open ---
  if (!isOpen || !project) return null

  // --- Helper Functions ---
  const getTypeIcon = (type: string) => {
    const config = transactionTypes.find(t => t.id === type)
    const Icon = config?.icon || DollarSign
    return <Icon className="w-4 h-4" />
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop with blur - like the site's overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Main Modal - Earthy glass card */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20 bg-black/30 backdrop-blur-sm">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedProject.name || ''}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                className="text-2xl font-bold bg-transparent border-b-2 border-[#D4AF37] text-white px-2 py-1 focus:outline-none w-full max-w-md"
                placeholder="Project Name"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Leaf className="w-6 h-6 text-[#D4AF37]" />
                {project.name}
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors group">
                  <Edit2 className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group">
                  <Trash2 className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { /* TODO: Save project */ setIsEditing(false) }} className="px-4 py-2 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditedProject(project); }} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Delete Project Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute top-20 right-6 z-20 bg-[#1A1F1A] border border-red-500/30 rounded-xl p-6 shadow-2xl w-80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-3">Delete Project?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone. All transactions will be lost.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={async () => { if (onDelete) { setIsDeletingProject(true); await onDelete(project.id); setIsDeletingProject(false); setShowDeleteConfirm(false); onClose(); } }} disabled={isDeletingProject} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                {isDeletingProject ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* --- Content Area with Two Columns: Summary Cards (Top) and Transactions (Bottom) --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* FINANCIAL SUMMARY SECTION - Prominently at the top */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Debit Card */}
            <div className="bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-red-400" /></div>
                <span className="text-gray-400 text-sm">Total Debit</span>
              </div>
              <div className="text-2xl font-bold text-red-400">₹{totalDebit.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Money spent on project</div>
            </div>
            {/* Credit Card */}
            <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-green-400" /></div>
                <span className="text-gray-400 text-sm">Total Credit</span>
              </div>
              <div className="text-2xl font-bold text-green-400">₹{totalCredit.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Money invested (capital)</div>
            </div>
            {/* Balance Card - Highlighted */}
            <div className="bg-gradient-to-br from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/30 rounded-xl p-5 backdrop-blur-sm md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg"><Wallet className="w-5 h-5 text-[#D4AF37]" /></div>
                <span className="text-gray-400 text-sm">Net Balance</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(balance).toLocaleString()}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${balance >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                  {balance >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Credit - Debit = Net position</div>
            </div>
          </div>

          {/* TRANSACTIONS SECTION */}
          <div className="space-y-4">
            {/* Section Header with Add Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-[#D4AF37] rounded-full"></span>
                Transaction Ledger
              </h3>
              {!showAddForm && !editingTransaction && (
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] transition-all text-sm font-medium">
                  <Plus className="w-4 h-4" /> Add Entry
                </button>
              )}
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingTransaction) && (
              <div className="bg-black/40 border border-[#D4AF37]/20 rounded-xl p-5 backdrop-blur-sm">
                <h4 className="text-md font-medium text-[#D4AF37] mb-4">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      {transactionTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  {/* Count (if applicable) */}
                  {!editingTransaction && (newTransaction.type === 'labour' || newTransaction.type === 'tractor' || newTransaction.type === 'sprinkler') && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Count</label>
                      <input
                        type="number"
                        value={newTransaction.count || ''}
                        onChange={(e) => setNewTransaction({ ...newTransaction, count: parseInt(e.target.value) || null })}
                        placeholder="e.g., 5"
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  )}
                  {editingTransaction && (editingTransaction.type === 'labour' || editingTransaction.type === 'tractor' || editingTransaction.type === 'sprinkler') && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Count</label>
                      <input
                        type="number"
                        value={editingTransaction.count || ''}
                        onChange={(e) => setEditingTransaction({ ...editingTransaction, count: parseInt(e.target.value) || null })}
                        className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  )}
                  {/* Amount */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={editingTransaction?.amount || newTransaction.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0
                        editingTransaction
                          ? setEditingTransaction({ ...editingTransaction, amount: val })
                          : setNewTransaction({ ...newTransaction, amount: val })
                      }}
                      className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder="0"
                    />
                  </div>
                  {/* Description */}
                  <div className="lg:col-span-2">
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
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                    className="px-4 py-2 text-sm bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032]"
                  >
                    {editingTransaction ? 'Update' : 'Add'} Entry
                  </button>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div className="border border-[#D4AF37]/20 rounded-xl overflow-hidden backdrop-blur-sm">
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
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-xs">
                        <div className="line-clamp-1">{t.description || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {t.count ? `${t.count} ${t.type === 'labour' ? 'workers' : t.type === 'tractor' ? 'units' : 'units'}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-red-400">
                        {t.type !== 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-400">
                        {t.type === 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => startEdit(t)} className="p-1 hover:bg-[#D4AF37]/20 rounded text-gray-400 hover:text-[#D4AF37]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-500">No transactions yet. Add your first entry.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}