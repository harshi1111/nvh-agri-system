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

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select(`
      *,
      projects (
        name,
        customer_id,
        customers (
          full_name
        )
      )
    `)
    .order('date', { ascending: false })
    .limit(10)

  return (
    <DashboardClient 
      customers={customers || []} 
      recentTransactions={recentTransactions || []} 
    />
  )
}