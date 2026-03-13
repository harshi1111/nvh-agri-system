'use client'

import { useState } from 'react'
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface AadhaarUploaderProps {
  customerId: string
  onUploadComplete: (imageUrl: string) => void
  onClose: () => void
}

export default function AadhaarUploader({ customerId, onUploadComplete, onClose }: AadhaarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    setError(null)

    try {
      // Upload to Supabase Storage
      const fileName = `aadhaar/${customerId}/${Date.now()}-${file.name}`
      
      const { data, error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(fileName)

      setSuccess(true)
      onUploadComplete(publicUrl)
      
      setTimeout(() => onClose(), 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#D4AF37]">Upload Aadhaar Card</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#D4AF37]/10 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {!preview && !isUploading && !success && (
        <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-8 text-center">
          <input
            type="file"
            id="aadhaar-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="aadhaar-upload" className="cursor-pointer flex flex-col items-center gap-3">
            <Camera className="w-12 h-12 text-[#D4AF37]" />
            <span className="text-white font-medium">Upload Aadhaar Card</span>
            <span className="text-sm text-gray-400">Take a photo or upload image</span>
          </label>
        </div>
      )}

      {preview && !isUploading && !success && (
        <div className="space-y-4">
          <div className="relative aspect-[1.6/1] w-full rounded-lg overflow-hidden border border-[#D4AF37]/20">
            <Image src={preview} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-white mt-2">Uploading...</p>
        </div>
      )}

      {success && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
          <p className="text-white mt-2">Upload successful!</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}