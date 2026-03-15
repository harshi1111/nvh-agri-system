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

// Define types for the database response
interface Transaction {
  id: string
  sequence_number: number
  date: string
  transaction_type_id: number
  quantity: number | null
  unit: string | null
  debit_amount: number
  credit_amount: number
  description: string | null
}

interface Project {
  id: string
  name: string
  status: string
  acres: number | null
  transactions: Transaction[]
}

interface Customer {
  id: string
  full_name: string
  contact_number: string
  email: string | null
  address: string | null
  is_active: boolean
  created_at: string
  projects: Project[]
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

  // Transform data - FIXED: Added type for project parameter
  const transformedCustomers = customers.map((customer: Customer) => ({
    ...customer,
    projects: customer.projects.map((project: Project) => ({  // Added type here
      ...project,
      transactions: project.transactions.map((transaction: Transaction) => {
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