import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const customerId = formData.get('customerId') as string
    
    if (!file || !customerId) {
      return NextResponse.json(
        { error: 'No image or customer ID provided' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const supabase = await createClient()
    const fileName = `aadhaar/${customerId}/${Date.now()}-${file.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(fileName, buffer)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('customer-documents')
      .getPublicUrl(fileName)

    // Return just the image URL - no OCR
    return NextResponse.json({
      imageUrl: publicUrl,
      message: 'Aadhaar uploaded successfully'
    })

  } catch (error: any) {
    console.error('Aadhaar upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload Aadhaar' },
      { status: 500 }
    )
  }
}