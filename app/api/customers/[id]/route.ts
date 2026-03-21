import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch customer with projects and plots
  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      projects (
        id,
        customer_id,
        name,
        type,
        acres,
        country,
        state,
        district,
        city,
        village,
        status,
        created_at,
        plots (
          id,
          project_id,
          type,
          plot_number,
          cent,
          acre_number,
          acre,
          created_at
        ),
        transactions (
          id,
          sequence_number,
          date,
          transaction_type_id,
          quantity,
          debit_amount,
          credit_amount,
          description
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Transform projects to ensure plots array exists
  const transformedCustomer = {
    ...customer,
    projects: customer?.projects?.map((project: any) => ({
      ...project,
      plots: project.plots || []
    })) || []
  }
  
  return NextResponse.json(transformedCustomer)
}