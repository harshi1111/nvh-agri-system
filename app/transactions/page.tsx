import { createClient } from '@/lib/supabase/server'
import TransactionsClient from './TransactionsClient'

interface Customer {
  id: string
  full_name: string
  contact_number: string
  email: string | null
  address: string | null
  is_active: boolean
  created_at: string
  aadhaar_number: string | null
  gender: string | null
  date_of_birth: string | null
}

export interface TransactionType {
  id: number
  name: string
  type: 'inflow' | 'outflow'
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  
  // Fetch transaction types
  const { data: transactionTypes } = await supabase
    .from('transaction_types')
    .select('*')
    .order('id', { ascending: true })
  
  // Fetch all active customers
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true })
  
  if (error) {
    console.error('Error fetching customers:', error)
    return <TransactionsClient customers={[]} frequentCustomers={[]} transactionTypes={transactionTypes || []} />
  }
  
  // Calculate frequent customers based on transaction count
  // First, get transaction counts per customer from transactions table
  const { data: transactionCounts } = await supabase
    .from('transactions')
    .select('projects!inner(customer_id)')
  
  const customerTransactionCount: Record<string, number> = {}
  transactionCounts?.forEach(t => {
    // Access the nested data correctly
    const projectData = t as any
    const customerId = projectData.projects?.customer_id
    if (customerId) {
      customerTransactionCount[customerId] = (customerTransactionCount[customerId] || 0) + 1
    }
  })
  
  // Also count plot transactions
  const { data: plotTransactionCounts } = await supabase
    .from('plot_transactions')
    .select('plots!inner(projects!inner(customer_id))')
  
  plotTransactionCounts?.forEach(t => {
    const plotData = t as any
    const customerId = plotData.plots?.projects?.customer_id
    if (customerId) {
      customerTransactionCount[customerId] = (customerTransactionCount[customerId] || 0) + 1
    }
  })
  
  // Add transaction count to customers
  const customersWithCount = customers?.map(customer => ({
    ...customer,
    transactionCount: customerTransactionCount[customer.id] || 0
  })) || []
  
  // Sort by transaction count for frequent customers
  const frequentCustomers = [...customersWithCount]
    .sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0))
    .slice(0, 5)
  
  return (
    <TransactionsClient 
      customers={customersWithCount}
      frequentCustomers={frequentCustomers}
      transactionTypes={transactionTypes || []}
    />
  )
}