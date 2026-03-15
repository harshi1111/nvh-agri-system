'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProjectData {
  customer_id: string
  name: string
  acres: number | null
  country: string
  state: string
  district: string
  city: string
  village: string | null
  status: string
}

// Allowed status values – now matching database constraint
const validStatuses = ['active', 'completed', 'on hold']

export async function createProject(formData: FormData | ProjectData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let projectData: ProjectData

  if (formData instanceof FormData) {
    projectData = {
      customer_id: formData.get('customer_id') as string,
      name: formData.get('name') as string,
      acres: formData.get('acres') ? parseFloat(formData.get('acres') as string) : null,
      country: (formData.get('country') as string) || 'India',
      state: formData.get('state') as string,
      district: formData.get('district') as string,
      city: formData.get('city') as string,
      village: formData.get('village') as string || null,
      status: formData.get('status') as string
    }
  } else {
    projectData = formData
  }

  // Validate required fields
  if (!projectData.customer_id || !projectData.name || !projectData.state || !projectData.city) {
    return { error: 'Missing required fields' }
  }

  // Validate status
  if (!validStatuses.includes(projectData.status)) {
    return { error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      customer_id: projectData.customer_id,
      name: projectData.name,
      acres: projectData.acres,
      country: projectData.country,
      state: projectData.state,
      district: projectData.district,
      city: projectData.city,
      village: projectData.village,
      status: projectData.status
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${projectData.customer_id}`)
  return { success: true, project: data }
}

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

  return data
}

export async function updateProject(id: string, formData: FormData | Partial<ProjectData>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let updateData: Partial<ProjectData>

  if (formData instanceof FormData) {
    updateData = {
      name: formData.get('name') as string || undefined,
      acres: formData.get('acres') ? parseFloat(formData.get('acres') as string) : undefined,
      country: formData.get('country') as string || undefined,
      state: formData.get('state') as string || undefined,
      district: formData.get('district') as string || undefined,
      city: formData.get('city') as string || undefined,
      village: formData.get('village') as string || undefined,
      status: formData.get('status') as string || undefined
    }
  } else {
    updateData = formData
  }

  // Remove undefined and empty strings, and validate status
  const cleanUpdateData: Partial<ProjectData> = {}
  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined && value !== '') {
      if (key === 'status') {
        // Only include status if it's a valid value
        if (validStatuses.includes(value as string)) {
          // FIXED: Use type assertion to bypass strict type checking
          (cleanUpdateData as any)[key] = value
        } else {
          console.error(`[updateProject] Attempted to set invalid status: "${value}"`)
          return { error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` }
        }
      } else {
        // FIXED: Use type assertion to bypass strict type checking
        (cleanUpdateData as any)[key] = value
      }
    }
  }

  console.log('[updateProject] cleanUpdateData:', cleanUpdateData)

  const { data, error } = await supabase
    .from('projects')
    .update(cleanUpdateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${data.customer_id}`)
  return { success: true, project: data }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: project } = await supabase
    .from('projects')
    .select('customer_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  if (project) {
    revalidatePath(`/customers/${project.customer_id}`)
  }
  
  return { success: true }
}