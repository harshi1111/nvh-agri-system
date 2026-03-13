'use client'

import { useState } from 'react'
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface AadhaarScannerProps {
  customerId: string
  onScanComplete: (data: {
    imageUrl: string
  }) => void
  onClose: () => void
}

export default function AadhaarScanner({ customerId, onScanComplete, onClose }: AadhaarScannerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('customerId', customerId)

      const response = await fetch('/api/extract-aadhaar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload Aadhaar')
      }

      setSuccess(true)
      onScanComplete({ imageUrl: data.imageUrl })
      
      setTimeout(() => onClose(), 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-[#D4AF37]">Upload Aadhaar</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#D4AF37]/10 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {!preview && !isUploading && !success && (
        <div className="border border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
          <input
            type="file"
            id="aadhaar-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="aadhaar-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-sm text-white">Upload Aadhaar image</span>
            <span className="text-xs text-gray-400">Image will be stored securely</span>
          </label>
        </div>
      )}

      {preview && !isUploading && !success && (
        <div className="relative aspect-square w-full max-w-[150px] mx-auto rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {isUploading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Uploading...</p>
        </div>
      )}

      {success && (
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
          <p className="text-xs text-green-400 mt-2">Upload successful!</p>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}