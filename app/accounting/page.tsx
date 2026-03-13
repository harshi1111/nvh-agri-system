import { createClient } from '@/lib/supabase/server'
import AccountingClient from './AccountingClient'

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

export default async function AccountingPage() {
  const supabase = await createClient()

  // Fetch ALL customers with their projects and transactions
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

  if (error) {
    console.error('Error fetching customers:', error)
    return <AccountingClient customers={[]} />
  }

  // Transform the data to include transaction type names and proper fields
  const transformedCustomers = customers.map(customer => ({
    ...customer,
    projects: customer.projects.map(project => ({
      ...project,
      transactions: project.transactions.map(transaction => {
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
          // For backward compatibility
          amount: transaction.debit_amount > 0 ? transaction.debit_amount : transaction.credit_amount,
        }
      })
    }))
  }))

  return <AccountingClient customers={transformedCustomers} />
}