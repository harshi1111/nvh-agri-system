'use client'

import { useState, useEffect, useRef } from 'react'
import { Plot } from '@/types/plot'
import {
  X, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Wallet, Users, Truck, Coffee,
  Tractor, Droplets, Sprout, FileText, Calendar
} from 'lucide-react'
import {
  createPlotTransaction,
  getPlotTransactionsByPlot,
  updatePlotTransaction,
  deletePlotTransaction
} from '@/lib/actions/plotTransactions'

interface Transaction {
  id: string
  serial_no: number
  date: string
  type: 'labour' | 'sprinkler' | 'transport' | 'food' | 'ploughing' | 'tractor' | 'dung' | 'investment' | 'miscellaneous'
  count?: number | null
  amount: number
  description: string
}

interface PlotTransactionsViewProps {
  isOpen: boolean
  onClose: () => void
  plot: Plot
  onTransactionUpdate?: () => void
}

const transactionTypes = [
  { id: 'labour', label: 'Labour', icon: Users, placeholder: 'e.g., 5 workers' },
  { id: 'transport', label: 'Transport', icon: Truck, placeholder: 'e.g., Tractor hire' },
  { id: 'food', label: 'Food', icon: Coffee, placeholder: 'e.g., Worker meals' },
  { id: 'ploughing', label: 'Ploughing', icon: Tractor, placeholder: 'e.g., Field prep' },
  { id: 'tractor', label: 'Tractor', icon: Tractor, placeholder: 'e.g., Harrowing' },
  { id: 'dung', label: 'Cow Dung', icon: Droplets, placeholder: 'e.g., Organic manure' },
  { id: 'sprinkler', label: 'Sprinkler', icon: Sprout, placeholder: 'e.g., 10 units' },
  { id: 'investment', label: 'Investment', icon: Wallet, placeholder: 'e.g., Capital' },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: FileText, placeholder: 'e.g., others' }
]

export default function PlotTransactionsView({ isOpen, onClose, plot, onTransactionUpdate }: PlotTransactionsViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [expandedMobileRow, setExpandedMobileRow] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'labour',
    amount: undefined,
    count: null,
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateIn(true), 50)
      loadTransactions()
    } else {
      setAnimateIn(false)
    }
  }, [isOpen, plot])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await getPlotTransactionsByPlot(plot.id)
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false
    let date = new Date(dateString)
    if (isNaN(date.getTime())) {
      const parts = dateString.split('-')
      if (parts.length === 3) {
      // Try DD-MM-YYYY
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      }
    }
    if (isNaN(date.getTime())) return false
    const year = date.getFullYear()
    const currentYear = new Date().getFullYear()
    if (year < 1900 || year > currentYear + 10) return false
    return true
  }

  const handleDateChange = (date: string, isEditing: boolean) => {
    setDateError(null)
    if (!validateDate(date)) {
      setDateError('Please enter a valid date (YYYY-MM-DD) with a 4-digit year between 1900 and current year + 10')
      return
    }
    if (isEditing && editingTransaction) {
      setEditingTransaction({ ...editingTransaction, date })
    } else {
      setNewTransaction({ ...newTransaction, date })
    }
  }

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker()
    }
  }

  const handleAddTransaction = async () => {
    if (!newTransaction.type || !newTransaction.date) return
    
    if (!validateDate(newTransaction.date)) {
      setDateError('Please enter a valid date with a 4-digit year')
      return
    }

    if (newTransaction.amount === undefined || newTransaction.amount === null) {
    setDateError('Please enter an amount')
    return
    }
    const amount = newTransaction.amount ?? 0

    setIsLoading(true)
    setDateError(null)
    try {
      const result = await createPlotTransaction(plot.id, {
        date: newTransaction.date,
        type: newTransaction.type as any,
        amount,
        description: newTransaction.description || '',
        count: newTransaction.count || null,
      })
      if (result.error) throw new Error(result.error)
      
      await loadTransactions()
      
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'labour',
        amount: undefined,
        count: null,
        description: ''
      })
      setDateError(null)
      
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return
    
    if (!validateDate(editingTransaction.date)) {
      setDateError('Please enter a valid date with a 4-digit year')
      return
    }

    setIsLoading(true)
    setDateError(null)
    try {
      const result = await updatePlotTransaction(editingTransaction.id, {
        date: editingTransaction.date,
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        count: editingTransaction.count,
      })
      if (result.error) throw new Error(result.error)
      await loadTransactions()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error updating transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    setIsLoading(true)
    try {
      const result = await deletePlotTransaction(id)
      if (result.error) throw new Error(result.error)
      await loadTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingTransaction(null)
    setDateError(null)
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
    setDateError(null)
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
      investment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      miscellaneous: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (!isOpen) return null

  const totalDebit = transactions.filter(t => t.type !== 'investment').reduce((s, t) => s + t.amount, 0)
  const totalCredit = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0)
  const balance = totalCredit - totalDebit

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className={`relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-sm flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              {plot.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`}
            </h2>
            {plot.type === 'plot' && plot.cent && <p className="text-xs text-gray-400">Cent: {plot.cent}</p>}
            {plot.type === 'acre' && plot.acre && <p className="text-xs text-gray-400">Acre: {plot.acre}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-4">
          <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3">
            <p className="text-xs text-gray-400">Debit</p>
            <p className="text-lg font-bold text-red-400">₹{totalDebit.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-3">
            <p className="text-xs text-gray-400">Credit</p>
            <p className="text-lg font-bold text-green-400">₹{totalCredit.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-xl p-3">
            <p className="text-xs text-gray-400">Balance</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ₹{Math.abs(balance).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold">Transaction Ledger</h3>
            {!showAddForm && !editingTransaction && (
              <button onClick={() => setShowAddForm(true)} className="px-3 py-1.5 bg-[#D4AF37] text-[#0A100A] rounded-lg text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            )}
          </div>

          {dateError && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400">{dateError}</p>
            </div>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingTransaction) && (
            <div className="bg-black/60 border border-[#D4AF37]/20 rounded-xl p-4 space-y-3">
              <h4 className="text-[#D4AF37] text-sm">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Date</label>
                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      type="text"
                      value={editingTransaction?.date || newTransaction.date}
                      onChange={(e) => handleDateChange(e.target.value, !!editingTransaction)}
          
                      placeholder="YYYY-MM-DD"
                      className={`w-full bg-black/50 border rounded-lg px-3 py-2 text-white text-sm pr-10 ${
                        dateError ? 'border-red-500/50 focus:border-red-500' : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={openDatePicker}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#D4AF37]/20 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Type</label>
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
                {((!editingTransaction && (newTransaction.type === 'labour' || newTransaction.type === 'tractor' || newTransaction.type === 'sprinkler')) ||
                  (editingTransaction && (editingTransaction.type === 'labour' || editingTransaction.type === 'tractor' || editingTransaction.type === 'sprinkler'))) && (
                  <div>
                    <label className="text-xs text-gray-400">Count</label>
                    <input
                      type="number"
                      value={editingTransaction?.count ?? newTransaction.count ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value)
                        editingTransaction
                          ? setEditingTransaction({ ...editingTransaction, count: val })
                          : setNewTransaction({ ...newTransaction, count: val })
                      }}
                      className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                      placeholder={editingTransaction?.type === 'labour' ? 'Workers' : 'Units'}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-400">Amount (₹)</label>
                  <input
                    type="number"
                    value={editingTransaction?.amount ?? newTransaction.amount ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseFloat(e.target.value)
                      if (editingTransaction) {
                        setEditingTransaction({ ...editingTransaction, amount: val })
                      } else {
                        setNewTransaction({ ...newTransaction, amount: val })
                      }
                    }}
                    step="any"
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400">Description</label>
                  <input
                    type="text"
                    value={editingTransaction?.description || newTransaction.description}
                    onChange={(e) => editingTransaction
                      ? setEditingTransaction({ ...editingTransaction, description: e.target.value })
                      : setNewTransaction({ ...newTransaction, description: e.target.value })
                    }
                    className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder={transactionTypes.find(t => t.id === (editingTransaction?.type || newTransaction.type))?.placeholder}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={resetForm} className="px-4 py-1 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">Cancel</button>
                <button onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction} disabled={isLoading} className="px-4 py-1 text-sm bg-[#D4AF37] text-[#0A100A] rounded-lg disabled:opacity-50">
                  {isLoading ? 'Saving...' : (editingTransaction ? 'Update' : 'Add')}
                </button>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {transactions.length === 0 && !isLoading ? (
            <div className="text-center py-8 bg-black/20 border border-[#D4AF37]/10 rounded-xl">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/40">
                  <tr className="text-gray-400">
                    <th className="text-left py-2 px-3">S.No</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Description</th>
                    <th className="text-left py-2 px-3">Count</th>
                    <th className="text-right py-2 px-3">Debit (₹)</th>
                    <th className="text-right py-2 px-3">Credit (₹)</th>
                    <th className="text-center py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-t border-[#D4AF37]/10 hover:bg-[#D4AF37]/5">
                      <td className="py-2 px-3 text-white font-mono">{t.serial_no}</td>
                      <td className="py-2 px-3 text-gray-300">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(t.type)}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-300 max-w-xs truncate">{t.description || '-'}</td>
                      <td className="py-2 px-3 text-gray-300">{t.count ?? '-'}</td>
                      <td className="py-2 px-3 text-right text-red-400">{t.type !== 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}</td>
                      <td className="py-2 px-3 text-right text-green-400">{t.type === 'investment' ? `₹${t.amount.toLocaleString()}` : '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => startEdit(t)} className="p-1 hover:text-[#D4AF37] text-gray-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-1 hover:text-red-400 text-gray-400 ml-1"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
