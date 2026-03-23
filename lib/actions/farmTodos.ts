'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface FarmTodo {
  id: string
  plot_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  reminder_enabled: boolean
  reminder_time: string | null
  created_at: string
}

export async function getFarmTodos(plotId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('farm_todos')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  
  if (plotId) {
    query = query.eq('plot_id', plotId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching todos:', error)
    return []
  }
  
  return data as FarmTodo[]
}

export async function createFarmTodo(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const plot_id = formData.get('plot_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const due_date = formData.get('due_date') as string || null
  const reminder_enabled = formData.get('reminder_enabled') === 'true'
  const reminder_time = formData.get('reminder_time') as string || null
  
  if (!plot_id || !title) {
    return { error: 'Plot and title are required' }
  }
  
  const { data, error } = await supabase
    .from('farm_todos')
    .insert({
      plot_id,
      title,
      description: description || null,
      due_date: due_date || null,
      reminder_enabled,
      reminder_time: reminder_time || null,
      completed: false
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating todo:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/dashboard`)
  return { success: true, todo: data }
}

export async function updateFarmTodo(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const updates: any = {}
  
  const title = formData.get('title') as string
  if (title) updates.title = title
  
  const description = formData.get('description') as string
  if (description !== undefined) updates.description = description || null
  
  const due_date = formData.get('due_date') as string
  if (due_date !== undefined) updates.due_date = due_date || null
  
  const completed = formData.get('completed')
  if (completed !== null) updates.completed = completed === 'true'
  
  const reminder_enabled = formData.get('reminder_enabled')
  if (reminder_enabled !== null) updates.reminder_enabled = reminder_enabled === 'true'
  
  const reminder_time = formData.get('reminder_time') as string
  if (reminder_time !== undefined) updates.reminder_time = reminder_time || null
  
  const { data, error } = await supabase
    .from('farm_todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating todo:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/dashboard`)
  return { success: true, todo: data }
}

export async function deleteFarmTodo(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('farm_todos')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting todo:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/dashboard`)
  return { success: true }
}

export async function toggleFarmTodoComplete(id: string, completed: boolean) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('farm_todos')
    .update({ completed })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error toggling todo:', error)
    return { error: error.message }
  }
  
  revalidatePath(`/dashboard`)
  return { success: true, todo: data }
}