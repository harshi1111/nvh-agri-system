'use server'

import { createClient } from '@/lib/supabase/server'
import { Project } from '@/types/project'
import { revalidatePath } from 'next/cache'

export async function getProjectsByCustomer(customerId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data as Project[]
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Extract form fields
  const customer_id = formData.get('customer_id') as string
  const name = formData.get('name') as string
  const acres = formData.get('acres') ? parseFloat(formData.get('acres') as string) : null
  const country = formData.get('country') as string || 'India'
  const state = formData.get('state') as string || null
  const district = formData.get('district') as string || null
  const village = formData.get('village') as string || null
  const status = formData.get('status') as string || 'active'

  // Validation
  if (!customer_id || !name) {
    return { error: 'Customer ID and project name are required' }
  }

  // Insert
  const { data, error } = await supabase
    .from('projects')
    .insert({
      customer_id,
      name,
      acres,
      country,
      state,
      district,
      village,
      status,
    })
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${customer_id}`)
  return { success: true, project: data }
}