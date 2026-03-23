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
  const transactionType = searchParams.get('transactionType')
  
  const supabase = await createClient()
  
  // First, get the transaction_type_id if transactionType filter is provided
  let transactionTypeId: number | null = null
  if (transactionType && transactionType !== 'all') {
    const { data: typeData } = await supabase
      .from('transaction_types')
      .select('id')
      .eq('name', transactionType)
      .maybeSingle()
    
    if (typeData) {
      transactionTypeId = typeData.id
    }
  }
  
  // Fetch customer with projects and filtered plots/transactions
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
  
  // Helper function to filter transactions by date and type
  const filterTransactions = (transactions: any[]) => {
    if (!transactions) return []
    
    return transactions.filter(t => {
      // Filter by date range
      if (fromDate && new Date(t.date) < new Date(fromDate)) return false
      if (toDate && new Date(t.date) > new Date(toDate)) return false
      
      // Filter by transaction type
      if (transactionTypeId !== null && t.transaction_type_id !== transactionTypeId) return false
      
      return true
    })
  }
  
  // Transform projects with filtered transactions
  const transformedCustomer = {
    ...customer,
    projects: customer?.projects?.map((project: any) => ({
      ...project,
      plots: project.plots?.map((plot: any) => ({
        ...plot,
        plot_transactions: filterTransactions(plot.plot_transactions)
      })) || [],
      transactions: filterTransactions(project.transactions)
    })) || []
  }
  
  return NextResponse.json(transformedCustomer)
}