'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TransactionType = "labour" | "sprinkler" | "transport" | "food" | "ploughing" | "tractor" | "dung" | "investment" | "miscellaneous";

const typeToIdMap: Record<TransactionType, number> = {
  'labour': 1,
  'sprinkler': 2,
  'transport': 3,
  'food': 4,
  'ploughing': 5,
  'tractor': 6,
  'dung': 7,
  'investment': 8,
  'miscellaneous': 16, 
}

const idToTypeMap: Record<number, TransactionType> = {
  1: 'labour',
  2: 'sprinkler',
  3: 'transport',
  4: 'food',
  5: 'ploughing',
  6: 'tractor',
  7: 'dung',
  8: 'investment',
  16: 'miscellaneous'
}

export async function createPlotTransaction(plotId: string, data: {
  date: string
  type: TransactionType
  amount: number
  description: string
  count?: number | null
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get next sequence number
  const { data: maxSeq } = await supabase
    .from('plot_transactions')
    .select('sequence_number')
    .eq('plot_id', plotId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSequence = (maxSeq?.sequence_number || 0) + 1

  const transaction_type_id = typeToIdMap[data.type]
  if (!transaction_type_id) {
    return { error: `Invalid transaction type: ${data.type}` }
  }

  const insertData: any = {
    plot_id: plotId,
    sequence_number: nextSequence,
    date: data.date,
    transaction_type_id,
    description: data.description,
    quantity: data.count || null,
  }

  if (data.type === 'investment') {
    insertData.credit_amount = data.amount
    insertData.debit_amount = 0
  } else {
    insertData.debit_amount = data.amount
    insertData.credit_amount = 0
  }

  const { data: transaction, error } = await supabase
    .from('plot_transactions')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating plot transaction:', error)
    return { error: error.message }
  }

  revalidatePath(`/customers/${plotId}`)
  return { success: true, transaction }
}

export async function getPlotTransactionsByPlot(plotId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plot_transactions')
    .select('*')
    .eq('plot_id', plotId)
    .order('sequence_number', { ascending: true })

  if (error) {
    console.error('Error fetching plot transactions:', error)
    return []
  }

  return data.map(t => ({
    id: t.id,
    serial_no: t.sequence_number,
    date: t.date,
    type: idToTypeMap[t.transaction_type_id] as TransactionType,
    amount: t.debit_amount > 0 ? t.debit_amount : t.credit_amount,
    description: t.description || '',
    count: t.quantity || null,
  }))
}

export async function updatePlotTransaction(id: string, data: Partial<{
  date: string
  type: TransactionType
  amount: number
  description: string
  count: number | null
}>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updateData: any = {
    date: data.date,
    description: data.description,
    quantity: data.count,
  }

  if (data.type) {
    const transaction_type_id = typeToIdMap[data.type]
    if (!transaction_type_id) {
      return { error: `Invalid transaction type: ${data.type}` }
    }
    updateData.transaction_type_id = transaction_type_id
  }

  if (data.type === 'investment') {
    updateData.credit_amount = data.amount
    updateData.debit_amount = 0
  } else if (data.type) {
    updateData.debit_amount = data.amount
    updateData.credit_amount = 0
  }

  const { data: transaction, error } = await supabase
    .from('plot_transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating plot transaction:', error)
    return { error: error.message }
  }

  return { success: true, transaction }
}

export async function deletePlotTransaction(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: transaction } = await supabase
    .from('plot_transactions')
    .select('plot_id, sequence_number')
    .eq('id', id)
    .single()

  if (!transaction) {
    return { error: 'Transaction not found' }
  }

  const { error } = await supabase
    .from('plot_transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting plot transaction:', error)
    return { error: error.message }
  }

  // Renumber remaining
  const { data: remaining } = await supabase
    .from('plot_transactions')
    .select('id, sequence_number')
    .eq('plot_id', transaction.plot_id)
    .order('sequence_number', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('plot_transactions')
        .update({ sequence_number: i + 1 })
        .eq('id', remaining[i].id)
    }
  }

  return { success: true }
}
