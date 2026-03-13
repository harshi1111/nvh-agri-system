'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTransactionTypes() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transaction_types')
    .select('*')
    .order('id')

  if (error) {
    console.error('Error fetching transaction types:', error)
    return []
  }

  return data
}