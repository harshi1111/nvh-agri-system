'use server'

import { createClient } from '@/lib/supabase/server'
import { Customer } from '@/types/customers'
import { revalidatePath } from 'next/cache'


// ===============================
// Get All Active Customers
// ===============================
export async function getCustomers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data as Customer[]
}


// ===============================
// Get Customer By ID
// ===============================
export async function getCustomerById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return data as Customer
}


// ===============================
// Create Customer
// ===============================
export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const full_name = formData.get('full_name') as string
  const aadhaar_number = formData.get('aadhaar_number') as string
  const contact_number = formData.get('contact_number') as string
  const email = formData.get('email') as string
  const gender = formData.get('gender') as string
  const date_of_birth = formData.get('date_of_birth') as string
  const address = formData.get('address') as string

  const is_active = true

  if (!full_name || !contact_number) {
    return { error: 'Name and contact number are required' }
  }

  // Duplicate Aadhaar check
  if (aadhaar_number) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('aadhaar_number', aadhaar_number)
      .maybeSingle()
    
    if (existing) {
      return { error: 'Customer with this Aadhaar number already exists' }
    }
  }

  // Duplicate contact check
  const { data: existingContact } = await supabase
    .from('customers')
    .select('id')
    .eq('contact_number', contact_number)
    .maybeSingle()
  
  if (existingContact) {
    return { error: 'Customer with this contact number already exists' }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      full_name,
      aadhaar_number: aadhaar_number || null,
      contact_number,
      email: email || null,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      is_active
    })
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { success: true, customer: data }
}


// ===============================
// Update Customer
// ===============================
export async function updateCustomer(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const aadhaar_number = formData.get('aadhaar_number') as string
  const contact_number = formData.get('contact_number') as string
  const email = formData.get('email') as string
  const gender = formData.get('gender') as string
  const date_of_birth = formData.get('date_of_birth') as string
  const address = formData.get('address') as string
  const is_active = formData.get('is_active') === 'true'

  if (!id || !full_name) {
    return { error: 'Customer ID and name are required' }
  }

  // Duplicate Aadhaar check
  if (aadhaar_number) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('aadhaar_number', aadhaar_number)
      .neq('id', id)
      .maybeSingle()
    
    if (existing) {
      return { error: 'Another customer with this Aadhaar number already exists' }
    }
  }

  // Duplicate contact check
  const { data: existingContact } = await supabase
    .from('customers')
    .select('id')
    .eq('contact_number', contact_number)
    .neq('id', id)
    .maybeSingle()
  
  if (existingContact) {
    return { error: 'Another customer with this contact number already exists' }
  }

  const { data, error } = await supabase
    .from('customers')
    .update({
      full_name,
      aadhaar_number: aadhaar_number || null,
      contact_number,
      email: email || null,
      gender: gender || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      is_active
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update error:', error)
    return { error: error.message }
  }

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true, customer: data }
}


// ===============================
// Soft Delete Customer
// ===============================
export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Delete error:', error)
    return { error: error.message }
  }

  revalidatePath('/customers')
  revalidatePath('/settings/archive')

  return { success: true }
}


// ===============================
// Restore Deleted Customer
// ===============================
export async function restoreCustomer(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('customers')
    .update({ is_active: true })
    .eq('id', id)

  if (error) {
    console.error('Restore error:', error)
    return { error: error.message }
  }

  revalidatePath('/customers')
  revalidatePath('/settings/archive')

  return { success: true }
}


// ===============================
// Get Deleted Customers
// ===============================
export async function getDeletedCustomers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deleted customers:', error)
    return []
  }

  return data as Customer[]
}
