import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerId } = await request.json()

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
  }

  // First, check if customer exists and is archived
  const { data: customer } = await supabase
    .from('customers')
    .select('is_active')
    .eq('id', customerId)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  if (customer.is_active) {
    return NextResponse.json({ error: 'Cannot permanently delete active customer' }, { status: 400 })
  }

  // Permanently delete the customer
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)

  if (error) {
    console.error('Permanent delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/settings/archive')
  return NextResponse.json({ success: true })
}