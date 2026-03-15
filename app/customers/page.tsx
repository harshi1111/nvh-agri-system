import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const supabase = await createClient()
  
  // Get total count for pagination
  const { count } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get first page of customers (20 per page)
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(0, 19)

  return (
    <CustomersClient 
      initialCustomers={customers || []} 
      totalCount={count || 0}
      currentPage={1}
    />
  )
}