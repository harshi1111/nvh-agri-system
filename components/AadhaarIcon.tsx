'use client'

import { useState, useEffect } from 'react'
import { IdCard, Camera, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface AadhaarIconProps {
  customerId: string
  existingImages?: string[]   // can be either public URLs or storage paths
  onImagesUpdated?: (images: string[]) => void
}

export default function AadhaarIcon({ customerId, existingImages = [], onImagesUpdated }: AadhaarIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [images, setImages] = useState<string[]>(existingImages)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loadingUrls, setLoadingUrls] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  // When modal opens, generate signed URLs for any images that are storage paths
  useEffect(() => {
    if (isOpen && images.length > 0) {
      const fetchSignedUrls = async () => {
        setLoadingUrls(true)
        const urlMap: Record<string, string> = {}
        for (const img of images) {
          // If it's already a full URL (starts with http), use it directly
          if (img.startsWith('http')) {
            urlMap[img] = img
          } else {
            // Otherwise assume it's a storage path and request a signed URL
            try {
              const res = await fetch(`/api/signed-url?path=${encodeURIComponent(img)}`)
              const data = await res.json()
              if (data.url) urlMap[img] = data.url
            } catch (err) {
              console.error('Failed to get signed URL for', img)
            }
          }
        }
        setSignedUrls(urlMap)
        setLoadingUrls(false)
      }
      fetchSignedUrls()
    }
  }, [isOpen, images])

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

      // Store only the path, not the public URL
      const newImages = [...images, fileName]
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
        className={`relative p-2 rounded-lg transition-all ${
          images.length > 0 
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
            : 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
        }`}
        title={images.length > 0 ? 'View Aadhaar' : 'Upload Aadhaar'}
      >
        <IdCard className="w-5 h-5" />
        {images.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A100A]"></span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0A100A] border-2 border-[#D4AF37]/30 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#D4AF37]/20">
              <h3 className="text-base font-semibold text-[#D4AF37]">
                Aadhaar Cards ({images.length}/2)
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-5">
              {loadingUrls ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Loading images...</p>
                </div>
              ) : images.length > 0 ? (
                <div className="space-y-5">
                  {/* Main Image */}
                  <div className="relative aspect-[1.6/1] w-full bg-black/40 rounded-lg overflow-hidden">
                    {signedUrls[images[selectedImageIndex]] ? (
                      <Image
                        src={signedUrls[images[selectedImageIndex]]}
                        alt="Aadhaar"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Failed to load image
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(i => (i > 0 ? i - 1 : images.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full hover:bg-[#D4AF37]/30 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(i => (i < images.length - 1 ? i + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full hover:bg-[#D4AF37]/30 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-12 rounded overflow-hidden border-3 flex-shrink-0 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-[#D4AF37] scale-105' 
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {signedUrls[img] ? (
                          <Image src={signedUrls[img]} alt="thumb" width={64} height={48} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                            ...
                          </div>
                        )}
                      </button>
                    ))}
                    
                    {/* Add more button */}
                    {images.length < 2 && (
                      <label className="w-16 h-12 rounded border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] flex-shrink-0 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-[#D4AF37]" />
                        )}
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <IdCard className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-4">No Aadhaar uploaded yet</p>
                  <label className="cursor-pointer inline-block px-5 py-2.5 bg-[#D4AF37] text-[#0A100A] text-sm font-medium rounded-lg hover:bg-[#C6A032] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? 'Uploading...' : 'Upload Aadhaar'}
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