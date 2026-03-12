// scripts/restore.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function restore(backupFile) {
  console.log(`🔄 Restoring from: ${backupFile}`)
  
  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
  
  for (const [table, tableData] of Object.entries(backupData)) {
    if (table === 'metadata') continue
    
    console.log(`📦 Restoring table: ${table}...`)
    
    // Clear existing data (careful!)
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error(`❌ Error clearing ${table}:`, deleteError)
      continue
    }
    
    // Insert backup data
    const { error: insertError } = await supabase
      .from(table)
      .insert(tableData.data)
    
    if (insertError) {
      console.error(`❌ Error restoring ${table}:`, insertError)
    } else {
      console.log(`✅ ${table}: ${tableData.count} records restored`)
    }
  }
  
  console.log('✨ Restore completed!')
}

// Get backup file from command line
const backupFile = process.argv[2]
if (!backupFile) {
  console.error('Please provide a backup file to restore')
  process.exit(1)
}

restore(backupFile)