'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProjectData {
  customer_id: string
  name: string
  type: 'plot' | 'acre'
  acres: number | null
  country: string
  state: string
  district: string
  city: string
  village: string | null
  status: string
}

const validStatuses = ['active', 'completed', 'on hold']

export async function createProject(formData: FormData | ProjectData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let projectData: ProjectData

  if (formData instanceof FormData) {
    const type = formData.get('type') as 'plot' | 'acre' || 'plot'
    
    projectData = {
      customer_id: formData.get('customer_id') as string,
      name: formData.get('name') as string,
      type,
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

  if (!projectData.customer_id || !projectData.name || !projectData.state || !projectData.city) {
    return { error: 'Missing required fields' }
  }

  if (!validStatuses.includes(projectData.status)) {
    return { error: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      customer_id: projectData.customer_id,
      name: projectData.name,
      type: projectData.type,
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

  let updateData: any = {}

  if (formData instanceof FormData) {
    const name = formData.get('name') as string
    if (name) updateData.name = name
    
    const type = formData.get('type') as string
    if (type && (type === 'plot' || type === 'acre')) updateData.type = type
    
    const acres = formData.get('acres') as string
    if (acres !== undefined && acres !== '') updateData.acres = parseFloat(acres)
    
    const country = formData.get('country') as string
    if (country) updateData.country = country
    
    const state = formData.get('state') as string
    if (state) updateData.state = state
    
    const district = formData.get('district') as string
    if (district !== undefined && district !== '') updateData.district = district
    
    const city = formData.get('city') as string
    if (city) updateData.city = city
    
    const village = formData.get('village') as string
    if (village !== undefined && village !== '') updateData.village = village
    
    const status = formData.get('status') as string
    if (status && validStatuses.includes(status)) updateData.status = status
  } else {
    // Handle object data
    updateData = { ...formData }
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key]
      }
    })
  }

  console.log('[updateProject] Updating with:', updateData)

  // If nothing to update, return early
  if (Object.keys(updateData).length === 0) {
    return { success: true, project: null }
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
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