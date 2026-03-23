import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const search = searchParams.get('search') || ''
  
  const supabase = await createClient()
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('full_name', { ascending: true })
  
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,contact_number.ilike.%${search}%`)
  }
  
  const { data: customers, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ customers, totalCount: count, page, pageSize })
}