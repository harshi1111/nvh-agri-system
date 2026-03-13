import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const tables = ['customers', 'projects', 'transactions', 'transaction_types']
    const backup: any = {
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0'
      }
    }
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
      
      if (error) {
        console.error(`Error backing up ${table}:`, error)
        continue
      }
      
      backup[table] = data
    }
    
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="nvh-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}