'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface TransactionData {
  project_id: string
  date: string
  type: string  // This is the frontend type name (labour, investment, etc.)
  amount: number
  description: string
  count?: number | null
}

// Map frontend type names to database transaction_type_id
const typeToIdMap: Record<string, number> = {
  'labour': 1,
  'sprinkler': 2,
  'transport': 3,
  'food': 4,
  'ploughing': 5,
  'tractor': 6,
  'dung': 7,
  'investment': 8
}

// Map database id to frontend type name
const idToTypeMap: Record<number, string> = {
  1: 'labour',
  2: 'sprinkler',
  3: 'transport',
  4: 'food',
  5: 'ploughing',
  6: 'tractor',
  7: 'dung',
  8: 'investment'
}

export async function createTransaction(projectId: string, data: TransactionData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get the current max sequence_number for this project
  const { data: maxSeq } = await supabase
    .from('transactions')
    .select('sequence_number')
    .eq('project_id', projectId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSequence = (maxSeq?.sequence_number || 0) + 1

  // Get the transaction_type_id from our map
  const transaction_type_id = typeToIdMap[data.type]
  if (!transaction_type_id) {
    return { error: `Invalid transaction type: ${data.type}` }
  }

  // Prepare insert data matching database schema
  const insertData: any = {
    project_id: projectId,
    sequence_number: nextSequence,
    date: data.date,
    transaction_type_id: transaction_type_id,
    description: data.description,
    quantity: data.count || null,
  }

  // Investment goes to credit_amount, others to debit_amount
  if (data.type === 'investment') {
    insertData.credit_amount = data.amount
    insertData.debit_amount = 0
  } else {
    insertData.debit_amount = data.amount
    insertData.credit_amount = 0
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${projectId}`)
  return { success: true, transaction }
}

export async function getTransactionsByProject(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('project_id', projectId)
    .order('sequence_number', { ascending: true })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  // TRANSFORM the data to match what the component expects
  return data.map(t => ({
    id: t.id,
    serial_no: t.sequence_number,
    date: t.date,
    // ✅ FIXED: Use idToTypeMap to convert transaction_type_id to type string
    type: idToTypeMap[t.transaction_type_id] || 'unknown',
    amount: t.debit_amount > 0 ? t.debit_amount : t.credit_amount,
    description: t.description || '',
    count: t.quantity || null,
    debit_amount: t.debit_amount || 0,
    credit_amount: t.credit_amount || 0,
  }))
}

export async function updateTransaction(id: string, data: Partial<TransactionData>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updateData: any = {
    date: data.date,
    description: data.description,
    quantity: data.count,
  }

  // If type is being updated, convert to transaction_type_id
  if (data.type) {
    const transaction_type_id = typeToIdMap[data.type]
    if (!transaction_type_id) {
      return { error: `Invalid transaction type: ${data.type}` }
    }
    updateData.transaction_type_id = transaction_type_id
  }

  // Handle amounts based on type
  if (data.type === 'investment') {
    updateData.credit_amount = data.amount
    updateData.debit_amount = 0
  } else if (data.type) {
    updateData.debit_amount = data.amount
    updateData.credit_amount = 0
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${transaction.project_id}`)
  return { success: true, transaction }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First get the transaction to know its project_id
  const { data: transaction } = await supabase
    .from('transactions')
    .select('project_id, sequence_number')
    .eq('id', id)
    .single()

  if (!transaction) {
    return { error: 'Transaction not found' }
  }

  // Delete the transaction
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { error: error.message }
  }

  // Renumber remaining transactions
  const { data: remaining } = await supabase
    .from('transactions')
    .select('id, sequence_number')
    .eq('project_id', transaction.project_id)
    .order('sequence_number', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('transactions')
        .update({ sequence_number: i + 1 })
        .eq('id', remaining[i].id)
    }
  }

  revalidatePath(`/customers/${transaction.project_id}`)
  return { success: true }
}