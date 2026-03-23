import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch all data needed for dashboard
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      projects (
        id,
        name,
        status,
        transactions (
          id,
          debit_amount,
          credit_amount,
          date
        )
      )
    `)
    .eq('is_active', true)

  // Get recent transactions from plot_transactions
  const { data: recentPlotTransactions } = await supabase
    .from('plot_transactions')
    .select(`
      id,
      date,
      transaction_type_id,
      debit_amount,
      credit_amount,
      description,
      plot_id,
      plots:plot_id (
        id,
        plot_number,
        acre_number,
        project_id,
        projects:project_id (
          id,
          name,
          customer_id,
          customers:customer_id (
            id,
            full_name
          )
        )
      )
    `)
    .order('date', { ascending: false })
    .limit(10)

  // Get recent project-level transactions
  const { data: recentProjectTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      date,
      transaction_type_id,
      debit_amount,
      credit_amount,
      description,
      project_id,
      projects:project_id (
        id,
        name,
        customer_id,
        customers:customer_id (
          id,
          full_name
        )
      )
    `)
    .order('date', { ascending: false })
    .limit(5)

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

  // Transform plot transactions
  const transformedPlotTransactions = (recentPlotTransactions || []).map(t => {
    // Handle the nested structure safely
    const plotsData = t.plots as any
    const projectsData = plotsData?.projects as any
    const customersData = projectsData?.customers as any
    
    return {
      id: t.id,
      date: t.date,
      transaction_type_id: t.transaction_type_id,
      debit_amount: t.debit_amount || 0,
      credit_amount: t.credit_amount || 0,
      description: t.description,
      type: idToTypeMap[t.transaction_type_id] || 'unknown',
      project_id: plotsData?.project_id || projectsData?.id,
      projects: {
        name: projectsData?.name,
        customers: {
          full_name: customersData?.full_name
        }
      }
    }
  })

  // Transform project transactions
  const transformedProjectTransactions = (recentProjectTransactions || []).map(t => {
    const projectsData = t.projects as any
    const customersData = projectsData?.customers as any
    
    return {
      id: t.id,
      date: t.date,
      transaction_type_id: t.transaction_type_id,
      debit_amount: t.debit_amount || 0,
      credit_amount: t.credit_amount || 0,
      description: t.description,
      type: idToTypeMap[t.transaction_type_id] || 'unknown',
      project_id: t.project_id,
      projects: {
        name: projectsData?.name,
        customers: {
          full_name: customersData?.full_name
        }
      }
    }
  })

  // Combine and sort by date
  const allTransactions = [...transformedPlotTransactions, ...transformedProjectTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <DashboardClient 
      customers={customers || []} 
      recentTransactions={allTransactions || []} 
    />
  )
}