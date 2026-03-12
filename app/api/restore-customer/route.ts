import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json()
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('customers')
      .update({ is_active: true })
      .eq('id', customerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore customer' }, { status: 500 })
  }
}