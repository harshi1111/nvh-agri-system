import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false)

  if (error) {
    console.error('Error counting archived customers:', error)
    return NextResponse.json({ count: 0 })
  }

  return NextResponse.json({ count: count || 0 })
}