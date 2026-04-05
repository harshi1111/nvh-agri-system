import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch all customers (for counts and display)
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      projects (
        id,
        name,
        status,
        acres
      )
    `)
    .eq('is_active', true)

  // Fetch ALL plot_transactions for dashboard calculations
  const { data: allPlotTransactions } = await supabase
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
        name,
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

  // Get recent transactions (last 10)
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
        name,
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

  // Map transaction type ID to name
  const idToTypeMap: Record<number, string> = {
    1: 'labour',
    2: 'sprinkler',
    3: 'transport',
    4: 'food',
    5: 'ploughing',
    6: 'tractor',
    7: 'dung',
    8: 'investment',
    16: 'miscellaneous'
  }

  // Transform transaction for display
  const transformTransaction = (t: any) => {
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
  }

  // Transform recent transactions
  const transformedRecentTransactions = (recentPlotTransactions || []).map(transformTransaction)

  // Calculate dashboard stats from ALL plot_transactions
  let totalDebit = 0
  let totalCredit = 0
  let totalTransactions = 0
  let activeProjectsSet = new Set()
  let totalProjectsSet = new Set()

  ;(allPlotTransactions || []).forEach(t => {
    totalDebit += t.debit_amount || 0
    totalCredit += t.credit_amount || 0
    totalTransactions++
    
    const plotsData = t.plots as any
    const projectId = plotsData?.project_id
    if (projectId) {
      totalProjectsSet.add(projectId)
      if ((t.debit_amount || 0) > 0 || (t.credit_amount || 0) > 0) {
        activeProjectsSet.add(projectId)
      }
    }
  })

  // Calculate weekly trends (last 7 days)
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyDebit = last7Days.map(day => {
    let sum = 0
    ;(allPlotTransactions || []).forEach(t => {
      if (t.date === day) sum += t.debit_amount || 0
    })
    return sum
  })

  const dailyCredit = last7Days.map(day => {
    let sum = 0
    ;(allPlotTransactions || []).forEach(t => {
      if (t.date === day) sum += t.credit_amount || 0
    })
    return sum
  })

  const stats = {
    totalCustomers: customers?.length || 0,
    activeProjects: activeProjectsSet.size,
    totalProjects: totalProjectsSet.size,
    netBalance: totalCredit - totalDebit,
    totalDebit: totalDebit,
    totalCredit: totalCredit,
    totalTransactions: totalTransactions,
    availableCash: (totalCredit - totalDebit) * 0.6,
    monthlyVolume: totalCredit + totalDebit
  }

  console.log("Dashboard Stats:", stats)

  return (
    <DashboardClient 
      customers={customers || []} 
      recentTransactions={transformedRecentTransactions || []}
      dashboardStats={stats}
      debitTrend={dailyDebit}
      creditTrend={dailyCredit}
    />
  )
}
