import { createClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'

const PAGE_SIZE = 100 // Increased to fetch more customers initially

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

export default async function ReportsPage() {
  const supabase = await createClient()
  
  try {
    // First get total count
    const { count: totalCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    console.log('Total customers count:', totalCount)
    
    // Fetch ALL customers with their projects and transactions (first PAGE_SIZE)
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        id,
        full_name,
        contact_number,
        email,
        address,
        projects:projects(
          id,
          name,
          status,
          acres,
          transactions:transactions(
            id,
            date,
            transaction_type_id,
            debit_amount,
            credit_amount,
            description
          )
        )
      `)
      .eq('is_active', true)
      .order('full_name', { ascending: true })
      .range(0, PAGE_SIZE - 1)
    
    if (error) {
      console.error('Error fetching customers:', error)
      return <ReportsClient customers={[]} totalCount={0} currentPage={1} pageSize={10} />
    }
    
    console.log('Fetched customers count:', customers?.length)
    
    // Transform the data to include transaction type names
    const transformedCustomers = customers?.map(customer => ({
      ...customer,
      projects: customer.projects?.map(project => ({
        ...project,
        transactions: project.transactions?.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          debit_amount: transaction.debit_amount || 0,
          credit_amount: transaction.credit_amount || 0,
          description: transaction.description,
          type: idToTypeMap[transaction.transaction_type_id] || 'unknown'
        })) || []
      })) || []
    })) || []
    
    console.log('Transformed customers:', transformedCustomers.length)
    
    return (
      <ReportsClient 
        customers={transformedCustomers} 
        totalCount={totalCount || 0} 
        currentPage={1} 
        pageSize={10}
      />
    )
  } catch (error) {
    console.error('Reports page error:', error)
    return <ReportsClient customers={[]} totalCount={0} currentPage={1} pageSize={10} />
  }
}