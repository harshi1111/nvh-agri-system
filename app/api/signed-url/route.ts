import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  
  if (!path) {
    return NextResponse.json({ error: 'Path missing' }, { status: 400 })
  }

  // Extract the relative path from the full URL if needed
  const filePath = path.replace(/^.*?\/storage\/v1\/object\/public\//, '')

  const { data } = await supabase.storage
    .from('customer-documents')
    .createSignedUrl(filePath, 60 * 60) // 1 hour expiry

  if (!data?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}