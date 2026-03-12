import { createClient } from '@/lib/supabase/server'
import ArchiveClient from './ArchiveClient'

export default async function ArchivePage() {
  const supabase = await createClient()
  
  // Get deleted customers (is_active = false)
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', false)
    .order('created_at', { ascending: false })  // Use created_at instead of updated_at

  if (error) {
    console.error('Error fetching deleted customers:', error)
    return <ArchiveClient initialCustomers={[]} />
  }

  return <ArchiveClient initialCustomers={data || []} />
}