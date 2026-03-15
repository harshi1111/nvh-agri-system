import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  
  const supabase = await createClient()
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ customers })
}