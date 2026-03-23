import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Get query parameters for filters
  const { searchParams } = new URL(request.url)
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')
  const limit = parseInt(searchParams.get('limit') || '50') // Limit transactions per project
  
  const supabase = await createClient()
  
  // Fetch customer with projects and limited plots
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
          created_at,
          plot_transactions (
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
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Helper function to filter and limit transactions
  const filterAndLimitTransactions = (transactions: any[]) => {
    if (!transactions) return []
    
    let filtered = transactions
    
    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter(t => t.date >= fromDate)
    }
    if (toDate) {
      filtered = filtered.filter(t => t.date <= toDate)
    }
    
    // Sort by date descending (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Limit to last N transactions
    return filtered.slice(0, limit)
  }
  
  // Transform projects with limited transactions
  const transformedCustomer = {
    ...customer,
    projects: customer?.projects?.map((project: any) => ({
      ...project,
      plots: project.plots?.map((plot: any) => ({
        ...plot,
        plot_transactions: filterAndLimitTransactions(plot.plot_transactions)
      })) || [],
      // Also limit project-level transactions if they exist
      transactions: filterAndLimitTransactions(project.transactions || [])
    })) || []
  }
  
  return NextResponse.json(transformedCustomer)
}