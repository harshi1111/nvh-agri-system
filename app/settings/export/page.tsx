'use client'

import { useState } from 'react'
import { Download, FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExportPage() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const response = await fetch(`/api/export?format=${format}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nvh-data-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Export Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
              <FileJson className="w-5 h-5" />
              JSON Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Export all data in JSON format. Best for backup and restoration.
            </p>
            <Button 
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="w-full btn-gold"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#D4AF37]">
              <FileSpreadsheet className="w-5 h-5" />
              CSV Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Export data as CSV. Open in Excel or Google Sheets.
            </p>
            <Button 
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="w-full btn-gold"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <strong className="text-white block mb-1">Important:</strong>
            Always export your data before making major changes. Keep backups in a safe place.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}