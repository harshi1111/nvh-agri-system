'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Plot {
  id: string
  project_id: string
  type: 'plot' | 'acre'
  plot_number: string | null
  cent: number | null
  acre_number: string | null
  acre: number | null
  created_at: string
}

interface CreatePlotData {
  project_id: string
  type: 'plot' | 'acre'
  plot_number?: string | null
  cent?: number | null
  acre_number?: string | null
  acre?: number | null
}

export async function createPlot(data: CreatePlotData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('plots')
    .insert({
      project_id: data.project_id,
      type: data.type,
      plot_number: data.plot_number ?? null,
      cent: data.cent ?? null,
      acre_number: data.acre_number ?? null,
      acre: data.acre ?? null,
    })

  if (error) {
    console.error('Error creating plot:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${data.project_id}`)
  return { success: true }
}

export async function getPlotsByProject(projectId: string): Promise<Plot[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plots')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching plots:', error)
    return []
  }

  return data as Plot[]
}

export async function updatePlot(id: string, data: Partial<CreatePlotData>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const update: any = {}
  if (data.plot_number !== undefined) update.plot_number = data.plot_number
  if (data.cent !== undefined) update.cent = data.cent
  if (data.acre_number !== undefined) update.acre_number = data.acre_number
  if (data.acre !== undefined) update.acre = data.acre

  const { error } = await supabase
    .from('plots')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('Error updating plot:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function deletePlot(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('plots')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting plot:', error)
    return { error: error.message }
  }

  return { success: true }
}