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

  // Get recent transactions from plot_transactions (actual transactions)
  const { data: recentPlotTransactions } = await supabase
    .from('plot_transactions')
    .select(`
      id,
      date,
      transaction_type_id,
      debit_amount,
      credit_amount,
      description,
      plots!inner (
        id,
        project_id,
        plot_number,
        acre_number,
        projects!inner (
          id,
          name,
          customer_id,
          customers!inner (
            id,
            full_name
          )
        )
      )
    `)
    .order('date', { ascending: false })
    .limit(10)

  // Also get recent project-level transactions if any
  const { data: recentProjectTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      date,
      transaction_type_id,
      debit_amount,
      credit_amount,
      description,
      projects (
        id,
        name,
        customer_id,
        customers (
          id,
          full_name
        )
      )
    `)
    .order('date', { ascending: false })
    .limit(5)

  // Combine and sort both types of transactions
  const allTransactions = [
    ...(recentPlotTransactions || []).map(t => ({
      id: t.id,
      date: t.date,
      transaction_type_id: t.transaction_type_id,
      debit_amount: t.debit_amount || 0,
      credit_amount: t.credit_amount || 0,
      description: t.description,
      type: 'plot_transaction',
      projects: {
        name: t.plots?.projects?.name,
        customers: {
          full_name: t.plots?.projects?.customers?.full_name
        }
      }
    })),
    ...(recentProjectTransactions || []).map(t => ({
      id: t.id,
      date: t.date,
      transaction_type_id: t.transaction_type_id,
      debit_amount: t.debit_amount || 0,
      credit_amount: t.credit_amount || 0,
      description: t.description,
      type: 'project_transaction',
      projects: {
        name: t.projects?.name,
        customers: {
          full_name: t.projects?.customers?.full_name
        }
      }
    }))
  ]

  // Sort by date descending and take top 10
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

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

  // Add type names to transactions
  const transactionsWithType = recentTransactions.map(t => ({
    ...t,
    type: idToTypeMap[t.transaction_type_id] || 'unknown'
  }))

  return (
    <DashboardClient 
      customers={customers || []} 
      recentTransactions={transactionsWithType || []} 
    />
  )
}