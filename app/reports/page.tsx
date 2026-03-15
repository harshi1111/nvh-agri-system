import { createClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'

const PAGE_SIZE = 10 // customers per page

// Map database id to frontend type name
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

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { page = '1' } = await searchParams
  const currentPage = parseInt(page, 10)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // Get total count of active customers
  const { count: totalCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (!totalCount) {
    return <ReportsClient customers={[]} totalCount={0} currentPage={1} pageSize={PAGE_SIZE} />
  }

  // Fetch paginated customers with projects and transactions
  const { data: customers, error } = await supabase
    .from('customers')
    .select(`
      *,
      projects (
        id,
        name,
        status,
        acres,
        transactions (
          id,
          sequence_number,
          date,
          transaction_type_id,
          quantity,
          unit,
          debit_amount,
          credit_amount,
          description
        )
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching customers:', error)
    return <ReportsClient customers={[]} totalCount={0} currentPage={1} pageSize={PAGE_SIZE} />
  }

  // Transform data
  const transformedCustomers = customers.map(customer => ({
    ...customer,
    projects: customer.projects.map(project => ({
      ...project,
      transactions: project.transactions.map(transaction => {
        const type = idToTypeMap[transaction.transaction_type_id] || 'unknown'
        return {
          id: transaction.id,
          date: transaction.date,
          type,
          description: transaction.description || '',
          quantity: transaction.quantity || null,
          unit: transaction.unit || null,
          debit_amount: transaction.debit_amount || 0,
          credit_amount: transaction.credit_amount || 0,
        }
      })
    }))
  }))

  return (
    <ReportsClient 
      customers={transformedCustomers} 
      totalCount={totalCount} 
      currentPage={currentPage} 
      pageSize={PAGE_SIZE}
    />
  )
}