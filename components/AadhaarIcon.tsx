'use client'

import { useState } from 'react'
import { IdCard, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface AadhaarIconProps {
  customerId: string
  existingImages?: string[]
  onImagesUpdated?: (images: string[]) => void
}

export default function AadhaarIcon({ customerId, existingImages = [], onImagesUpdated }: AadhaarIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [images, setImages] = useState<string[]>(existingImages)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileName = `aadhaar/${customerId}/${Date.now()}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('customer-documents')
        .getPublicUrl(fileName)

      const newImages = [...images, publicUrl]
      setImages(newImages)
      onImagesUpdated?.(newImages)
      setShowUploader(false)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-1.5 rounded-lg transition-all ${
          images.length > 0 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
        }`}
        title={images.length > 0 ? 'View Aadhaar' : 'Upload Aadhaar'}
      >
        <IdCard className="w-4 h-4" />
        {images.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[#0A100A]"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-2xl bg-[#0A100A] border border-[#D4AF37]/30 rounded-xl shadow-2xl">
            
            <div className="flex items-center justify-between p-3 border-b border-[#D4AF37]/20">
              <h3 className="text-sm font-semibold text-[#D4AF37]">
                Aadhaar Cards ({images.length}/2)
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#D4AF37]/10 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              {images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[1.6/1] w-full bg-black/40 rounded-lg overflow-hidden">
                    <Image
                      src={images[selectedImageIndex]}
                      alt="Aadhaar"
                      fill
                      className="object-contain"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(i => (i > 0 ? i - 1 : images.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full hover:bg-[#D4AF37]/20"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(i => (i < images.length - 1 ? i + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full hover:bg-[#D4AF37]/20"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-12 h-8 rounded overflow-hidden border-2 flex-shrink-0 ${
                          selectedImageIndex === index ? 'border-[#D4AF37]' : 'border-transparent'
                        }`}
                      >
                        <Image src={img} alt="thumb" width={48} height={32} className="object-cover" />
                      </button>
                    ))}
                    
                    {/* Add more button */}
                    {images.length < 2 && (
                      <label className="w-12 h-8 rounded border border-dashed border-[#D4AF37]/30 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <Camera className="w-4 h-4 text-[#D4AF37]" />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <IdCard className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-3">No Aadhaar uploaded</p>
                  <label className="cursor-pointer inline-block px-3 py-1.5 bg-[#D4AF37] text-[#0A100A] text-xs rounded-lg hover:bg-[#C6A032]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    Upload Aadhaar
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}