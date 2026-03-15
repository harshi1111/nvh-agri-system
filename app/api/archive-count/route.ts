import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false)

    if (error) {
      console.error('Supabase error counting archived customers:', error)
      return NextResponse.json(
        { error: error.message, count: 0 },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (err) {
    console.error('Unexpected error in archive-count API:', err)
    return NextResponse.json(
      { error: 'Internal server error', count: 0 },
      { status: 500 }
    )
  }
}