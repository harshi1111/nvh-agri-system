'use client'

import { useState } from 'react'
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Tesseract from 'tesseract.js'

interface AadhaarScannerProps {
  customerId: string
  onScanComplete: (data: {
    imageUrl: string
    name?: string
    aadhaarNumber?: string
    dob?: string
    gender?: string
    address?: string
  }) => void
  onClose: () => void
}

export default function AadhaarScanner({ customerId, onScanComplete, onClose }: AadhaarScannerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isOcrRunning, setIsOcrRunning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [extractedFields, setExtractedFields] = useState<string[]>([])

  const parseAadhaarText = (text: string) => {
    console.log('Raw OCR text for parsing:', text)

    const result: { aadhaarNumber?: string; dob?: string; gender?: string } = {}

    // Aadhaar number: 12 digits (optionally with spaces)
    const aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/)
    if (aadhaarMatch) {
      result.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '')
      console.log('Found Aadhaar:', result.aadhaarNumber)
    }

    // DOB: DD/MM/YYYY or DD-MM-YYYY
    const dobMatch = text.match(/\b\d{2}[\/-]\d{2}[\/-]\d{4}\b/)
    if (dobMatch) {
      result.dob = dobMatch[0]
      console.log('Found DOB:', result.dob)
    }

    // Gender: always in English on Aadhaar
    const genderMatch = text.match(/\b(Male|Female)\b/i)
    if (genderMatch) {
      result.gender = genderMatch[0].charAt(0).toUpperCase() + genderMatch[0].slice(1).toLowerCase()
      console.log('Found Gender:', result.gender)
    }

    return result
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    setError(null)
    setExtractedFields([])

    try {
      // 1. Upload to Supabase
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('customerId', customerId)

      const uploadRes = await fetch('/api/extract-aadhaar', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed (${uploadRes.status})`)
      }

      const uploadData = await uploadRes.json()
      if (!uploadData.path) throw new Error('No image path returned')
      const imagePath = uploadData.path

      // 2. Run OCR on the original file
      setIsOcrRunning(true)
      
      // Create a promise that will timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OCR timed out – please try a clearer image')), 20000)
      })

      let text = ''
      try {
        console.log('Starting Tesseract recognition...')
        
        // Run OCR without signal (since it's not supported in types)
        const resultPromise = Tesseract.recognize(
          file, 
          'eng', 
          {
            logger: (m) => {
              console.log('OCR progress:', m)
            },
          }
        )
        
        // Race between OCR and timeout
        const result = await Promise.race([resultPromise, timeoutPromise]) as Awaited<typeof resultPromise>
        
        text = result.data.text
        console.log('OCR completed, raw text:', text)
      } catch (ocrErr: any) {
        console.error('OCR error:', ocrErr)
        throw ocrErr
      }

      // 3. Parse the text
      const extracted = parseAadhaarText(text)

      const found = []
      if (extracted.aadhaarNumber) found.push('Aadhaar number')
      if (extracted.dob) found.push('DOB')
      if (extracted.gender) found.push('gender')
      setExtractedFields(found)

      if (found.length === 0) {
        setError('Could not auto‑fill any fields. Please enter them manually.')
        console.warn('No fields extracted from OCR text.')
      }

      setSuccess(true)
      onScanComplete({
        imageUrl: imagePath,
        aadhaarNumber: extracted.aadhaarNumber,
        dob: extracted.dob,
        gender: extracted.gender,
      })

      if (found.length > 0) {
        setTimeout(() => onClose(), 2000)
      }
    } catch (err: unknown) {
      console.error('Full error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsUploading(false)
      setIsOcrRunning(false)
    }
  }

  const isProcessing = isUploading || isOcrRunning

  return (
    <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-[#D4AF37]">Scan Aadhaar</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#D4AF37]/10 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {!preview && !isProcessing && !success && (
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
            <span className="text-xs text-gray-400">Auto-fills all details</span>
          </label>
        </div>
      )}

      {preview && !isProcessing && !success && (
        <div className="relative aspect-[1.6/1] w-full max-w-md mx-auto rounded-lg overflow-hidden">
          <Image src={preview} alt="Preview" fill className="object-cover" />
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-gray-400 mt-2">
            {isUploading ? 'Uploading...' : 'Scanning...'}
          </p>
        </div>
      )}

      {success && (
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
          <p className="text-xs text-green-400 mt-2">
            {extractedFields.length > 0
              ? `✓ Found: ${extractedFields.join(', ')}`
              : 'Upload complete (no fields auto‑filled)'}
          </p>
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