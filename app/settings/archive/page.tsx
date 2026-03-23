import { createClient } from '@/lib/supabase/server'
import ArchiveClient from './ArchiveClient'

export default async function ArchivePage() {
  const supabase = await createClient()
  
  // Get deleted customers (is_active = false) with archive_reason and archived_at
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', false)
    .order('archived_at', { ascending: false })  // Remove nullsLast, it's not supported

  if (error) {
    console.error('Error fetching deleted customers:', error)
    return <ArchiveClient initialCustomers={[]} />
  }

  return <ArchiveClient initialCustomers={data || []} />
}