import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const customerId = searchParams.get('customerId')
  const projectId = searchParams.get('projectId')
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  
  const supabase = await createClient()
  
  try {
    // Map transaction type ID to name
    const idToTypeMap: Record<number, string> = {
      1: 'labour',
      2: 'sprinkler',
      3: 'transport',
      4: 'food',
      5: 'ploughing',
      6: 'tractor',
      7: 'dung',
      8: 'investment'
    }
    
    // Get all active customers
    let customersQuery = supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true })
    
    if (customerId && customerId !== 'all') {
      customersQuery = customersQuery.eq('id', customerId)
    }
    
    const { data: customers, error: customersError } = await customersQuery
    
    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }
    
    // For each customer, fetch their projects and plot_transactions
    const customersWithData = await Promise.all(
      (customers || []).map(async (customer) => {
        // Get projects for this customer
        let projectsQuery = supabase
          .from('projects')
          .select(`
            id,
            name,
            status,
            acres,
            plots:plots(
              id,
              type,
              plot_number,
              cent,
              acre_number,
              acre,
              plot_transactions:plot_transactions(
                id,
                date,
                transaction_type_id,
                debit_amount,
                credit_amount,
                description
              )
            )
          `)
          .eq('customer_id', customer.id)
        
        if (projectId && projectId !== 'all') {
          projectsQuery = projectsQuery.eq('id', projectId)
        }
        
        const { data: projects, error: projectsError } = await projectsQuery
        
        if (projectsError) {
          console.error(`Error fetching projects for customer ${customer.id}:`, projectsError)
          return { ...customer, projects: [] }
        }
        
        // Process each project to collect transactions from all plots
        const projectsWithTransactions = (projects || []).map(project => {
          // Collect all transactions from all plots in this project
          let allTransactions: any[] = []
          
          if (project.plots) {
            project.plots.forEach((plot: any) => {
              if (plot.plot_transactions) {
                plot.plot_transactions.forEach((t: any) => {
                  // Apply date filters
                  if (fromDate && t.date < fromDate) return
                  if (toDate && t.date > toDate) return
                  
                  allTransactions.push({
                    id: t.id,
                    date: t.date,
                    transaction_type_id: t.transaction_type_id,
                    debit_amount: t.debit_amount || 0,
                    credit_amount: t.credit_amount || 0,
                    description: t.description,
                    plot_name: plot.type === 'plot' ? `Plot ${plot.plot_number}` : `Acre ${plot.acre_number}`
                  })
                })
              }
            })
          }
          
          // Also get project-level transactions (if any)
          // You might have a separate transactions table too
          
          // Sort transactions by date (newest first)
          allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          
          // Add type names
          const typedTransactions = allTransactions.map(t => ({
            ...t,
            type: idToTypeMap[t.transaction_type_id] || 'unknown'
          }))
          
          return {
            id: project.id,
            name: project.name,
            status: project.status,
            acres: project.acres,
            transactions: typedTransactions
          }
        })
        
        return {
          ...customer,
          projects: projectsWithTransactions
        }
      })
    )
    
    // Paginate results
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedCustomers = customersWithData.slice(start, end)
    const totalCount = customersWithData.length
    
    return NextResponse.json({
      customers: paginatedCustomers,
      totalCount,
      page,
      pageSize
    })
    
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ 
      customers: [], 
      totalCount: 0, 
      page, 
      pageSize,
      error: 'Failed to fetch reports' 
    }, { status: 500 })
  }
}