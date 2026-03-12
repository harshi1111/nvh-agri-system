// scripts/backup.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// For GitHub Actions, env vars are already set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function backup() {
  console.log('🔄 Starting database backup...')
  
  const tables = ['customers', 'projects', 'transactions', 'transaction_types']
  const backup = {
    metadata: {
      exported_at: new Date().toISOString(),
      version: '1.0',
      tables: tables
    }
  }
  
  let successCount = 0
  let failCount = 0
  
  for (const table of tables) {
    console.log(`📦 Backing up table: ${table}...`)
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
    
    if (error) {
      console.error(`❌ Error backing up ${table}:`, error.message)
      backup[table] = { error: error.message }
      failCount++
      continue
    }
    
    backup[table] = {
      count: data.length,
      data: data
    }
    successCount++
    console.log(`✅ ${table}: ${data.length} records`)
  }
  
  // Create filename with timestamp
  const date = new Date()
  const filename = `backup-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.json`
  
  // Ensure backups directory exists
  const backupsDir = path.join(__dirname, '../backups')
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true })
  }
  
  // Write backup file
  const filePath = path.join(backupsDir, filename)
  fs.writeFileSync(
    filePath,
    JSON.stringify(backup, null, 2)
  )
  
  console.log('\n📊 Backup Summary:')
  console.log(`✅ Successful: ${successCount} tables`)
  console.log(`❌ Failed: ${failCount} tables`)
  console.log(`💾 Saved to: ${filename}`)
  console.log(`📁 Full path: ${filePath}`)
  
  // Create a latest.json symlink or copy (optional)
  const latestPath = path.join(backupsDir, 'latest.json')
  fs.writeFileSync(latestPath, JSON.stringify(backup, null, 2))
  
  console.log('✨ Backup completed!')
}

// Run backup with error handling
backup().catch(error => {
  console.error('💥 Backup failed:', error)
  process.exit(1)
})