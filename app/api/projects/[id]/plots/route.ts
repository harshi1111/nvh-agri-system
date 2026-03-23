import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch plots for this project/farm
  const { data: plots, error } = await supabase
    .from('plots')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching plots:', error)
    return NextResponse.json([])
  }

  return NextResponse.json(plots || [])
}