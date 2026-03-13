'use client'

import { useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Tesseract from 'tesseract.js'
import { createClient } from '@/lib/supabase/client'

interface AadhaarScannerProps {
  customerId: string
  onScanComplete: (data: {
    aadhaarNumber: string
    dob: string
    gender: string
    imageUrl: string
  }) => void
  onClose: () => void
}

export default function AadhaarScanner({ customerId, onScanComplete, onClose }: AadhaarScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Upload image to storage first
      const fileName = `aadhaar/${customerId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(fileName)

      // Step 2: OCR to extract data
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })

      // Step 3: Extract only the fields we need
      const extractedData = extractAadhaarFields(text)

      // Step 4: Return all data
      onScanComplete({
        aadhaarNumber: extractedData.aadhaarNumber,
        dob: extractedData.dob,
        gender: extractedData.gender,
        imageUrl: publicUrl
      })

      setTimeout(onClose, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const extractAadhaarFields = (text: string) => {
    const result = {
      aadhaarNumber: '',
      dob: '',
      gender: ''
    }

    // Extract Aadhaar number (12 digits)
    const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)
    if (aadhaarMatch) {
      result.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '')
    }

    // Extract DOB (DD/MM/YYYY)
    const dobMatch = text.match(/\b(\d{2}[/-]\d{2}[/-]\d{4})\b/)
    if (dobMatch) {
      const [day, month, year] = dobMatch[1].split(/[/-]/)
      result.dob = `${year}-${month}-${day}`
    }

    // Extract Gender
    if (text.match(/Female|FEMALE|महिला/)) result.gender = 'Female'
    else if (text.match(/Male|MALE|पुरुष/)) result.gender = 'Male'

    return result
  }

  return (
    <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-[#D4AF37]">Scan Aadhaar</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#D4AF37]/10 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {!preview && !isProcessing && (
        <div className="border border-dashed border-[#D4AF37]/30 rounded-lg p-4 text-center">
          <input
            type="file"
            id="aadhaar-scan"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="aadhaar-scan" className="cursor-pointer flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-sm text-white">Upload Aadhaar to scan</span>
            <span className="text-xs text-gray-400">Auto-fills number, DOB & gender</span>
          </label>
        </div>
      )}

      {preview && !isProcessing && (
        <div className="relative aspect-square w-full max-w-[150px] mx-auto rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Scanning... {progress}%</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}