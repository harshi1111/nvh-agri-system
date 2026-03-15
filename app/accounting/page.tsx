import { createClient } from '@/lib/supabase/server'
import AccountingClient from './AccountingClient'

// Define types (same as before)
interface Transaction {
  id: string
  sequence_number: number
  date: string
  transaction_type_id: number
  quantity: number | null
  unit: string | null
  debit_amount: number | null
  credit_amount: number | null
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
  is_active: boolean
  created_at: string
  projects: Project[]
}

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

const PAGE_SIZE = 10 // Adjust as needed

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AccountingPage({ searchParams }: PageProps) {
  const { page = '1' } = await searchParams
  const currentPage = parseInt(page, 10)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  // Get total count of active customers
  const { count: totalCount, error: countError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (countError) {
    console.error('Error counting customers:', countError)
    return <AccountingClient customers={[]} totalCount={0} currentPage={1} pageSize={PAGE_SIZE} />
  }

  if (!totalCount) {
    return <AccountingClient customers={[]} totalCount={0} currentPage={1} pageSize={PAGE_SIZE} />
  }

  // Fetch paginated customers with their projects and transactions
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
    return <AccountingClient customers={[]} totalCount={totalCount} currentPage={currentPage} pageSize={PAGE_SIZE} />
  }

  const typedCustomers = (customers || []) as Customer[]

  const transformedCustomers = typedCustomers.map((customer: Customer) => ({
    ...customer,
    projects: customer.projects.map((project: Project) => ({
      ...project,
      transactions: project.transactions.map((transaction: Transaction) => {
        const type = idToTypeMap[transaction.transaction_type_id] || 'unknown'
        return {
          id: transaction.id,
          sequence_number: transaction.sequence_number,
          date: transaction.date,
          type: type,
          description: transaction.description || '',
          quantity: transaction.quantity || null,
          unit: transaction.unit || null,
          debit_amount: transaction.debit_amount || 0,
          credit_amount: transaction.credit_amount || 0,
          amount: (transaction.debit_amount || 0) > 0 ? transaction.debit_amount : transaction.credit_amount,
        }
      })
    }))
  }))

  return (
    <AccountingClient 
      customers={transformedCustomers} 
      totalCount={totalCount} 
      currentPage={currentPage} 
      pageSize={PAGE_SIZE}
    />
  )
}