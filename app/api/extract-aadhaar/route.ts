import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const customerId = formData.get('customerId') as string

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is missing' },
        { status: 400 }
      )
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Check file type (allow common image formats)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WEBP.' },
        { status: 400 }
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const supabase = await createClient()
    const fileName = `aadhaar/${customerId}/${Date.now()}-${file.name}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image to storage. Please try again.' },
        { status: 500 }
      )
    }

    // Return the storage path, NOT the public URL
    return NextResponse.json({ 
      path: fileName, 
      success: true 
    })

  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during upload.' },
      { status: 500 }
    )
  }
}