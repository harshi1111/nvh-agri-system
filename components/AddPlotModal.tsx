'use client'

import { useState, useEffect } from 'react'
import { createPlot, updatePlot } from '@/lib/actions/plots'
import { X, Hash, Ruler, Edit2 } from 'lucide-react'
import { Plot } from '@/types/plot'

interface AddPlotModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  type: 'plot' | 'acre'
  onPlotAdded?: () => void
  editingPlot?: Plot | null  // NEW: for editing
}

export default function AddPlotModal({ 
  isOpen, 
  onClose, 
  projectId, 
  type, 
  onPlotAdded,
  editingPlot 
}: AddPlotModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [plotNumber, setPlotNumber] = useState('')
  const [cent, setCent] = useState('')
  const [acreNumber, setAcreNumber] = useState('')
  const [acre, setAcre] = useState('')
  const [animateIn, setAnimateIn] = useState(false)

  // Load editing data if provided
  useEffect(() => {
    if (editingPlot) {
      if (editingPlot.type === 'plot') {
        setPlotNumber(editingPlot.plot_number || '')
        setCent(editingPlot.cent?.toString() || '')
      } else {
        setAcreNumber(editingPlot.acre_number || '')
        setAcre(editingPlot.acre?.toString() || '')
      }
    }
  }, [editingPlot])

  // Animation on open
  useEffect(() => {
    if (isOpen) setTimeout(() => setAnimateIn(true), 50)
    else setAnimateIn(false)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingPlot) {
        // UPDATE existing plot
        const updateData: any = {}
        if (type === 'plot') {
          updateData.plot_number = plotNumber || null
          updateData.cent = cent ? parseFloat(cent) : null
        } else {
          updateData.acre_number = acreNumber || null
          updateData.acre = acre ? parseFloat(acre) : null
        }
        
        const result = await updatePlot(editingPlot.id, updateData)
        if (result.error) {
          console.error('Error updating plot:', result.error)
        } else {
          onPlotAdded?.()
          handleClose()
        }
      } else {
        // CREATE new plot
        const data = {
          project_id: projectId,
          type,
          plot_number: type === 'plot' ? plotNumber : null,
          cent: type === 'plot' ? (cent ? parseFloat(cent) : null) : null,
          acre_number: type === 'acre' ? acreNumber : null,
          acre: type === 'acre' ? (acre ? parseFloat(acre) : null) : null,
        }
        const result = await createPlot(data)
        if (result.error) {
          console.error('Error creating plot:', result.error)
        } else {
          onPlotAdded?.()
          handleClose()
        }
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
    setPlotNumber('')
    setCent('')
    setAcreNumber('')
    setAcre('')
  }

  if (!isOpen) return null

  const isEditing = !!editingPlot

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B88D2B] rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gradient-to-br from-[#0F1A0F] to-[#1E2E1E] border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-5 py-4 border-b border-[#D4AF37]/20 bg-[#0A150A] flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing && <Edit2 className="w-4 h-4 text-[#D4AF37]" />}
              {isEditing ? `Edit ${type === 'plot' ? 'Plot' : 'Acre'}` : `Add New ${type === 'plot' ? 'Plot' : 'Acre'}`}
            </h2>
            <button onClick={handleClose} className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {type === 'plot' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Plot Number <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
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
                    value={cent}
                    onChange={(e) => setCent(e.target.value)}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Optional"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Acre Number <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={acreNumber}
                    onChange={(e) => setAcreNumber(e.target.value)}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white"
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
                    value={acre}
                    onChange={(e) => setAcre(e.target.value)}
                    className="w-full bg-black/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white"
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 text-xs bg-[#D4AF37] text-[#0A100A] rounded-lg hover:bg-[#C6A032] disabled:opacity-50 flex items-center gap-2">
                {isLoading ? 'Saving...' : (isEditing ? 'Update' : `Add ${type === 'plot' ? 'Plot' : 'Acre'}`)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}