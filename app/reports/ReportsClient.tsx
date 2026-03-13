'use client'

import { useState, useMemo } from 'react'
import { 
  Download, 
  Calendar, 
  Filter, 
  Users, 
  FolderTree,
  FileText,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from '@/lib/utils/date'

interface Transaction {
  id: string
  date: string
  type: string
  description: string
  quantity: number | null
  unit: string | null
  debit_amount: number
  credit_amount: number
}

interface Project {
  id: string
  name: string
  status: string
  acres: number | null
  transactions: Transaction[]
}

interface Customer {
  id: string
  full_name: string
  contact_number: string
  projects: Project[]
}

interface ReportsClientProps {
  customers: Customer[]
}

export default function ReportsClient({ customers }: ReportsClientProps) {
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'customer'>('summary')
  const [isExporting, setIsExporting] = useState(false)

  // Get active customers
  const activeCustomers = useMemo(() => {
    return customers
  }, [customers])

  // Get projects for selected customer
  const availableProjects = useMemo(() => {
    if (selectedCustomer === 'all') return []
    const customer = activeCustomers.find(c => c.id === selectedCustomer)
    return customer?.projects || []
  }, [activeCustomers, selectedCustomer])

  // Filter transactions by date range
  const filterTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      if (dateRange.from && new Date(dateRange.from) > transactionDate) return false
      if (dateRange.to && new Date(dateRange.to) < transactionDate) return false
      return true
    })
  }

  // Get filtered data based on selections
  const filteredData = useMemo(() => {
    let filtered = [...activeCustomers]

    // Filter by customer
    if (selectedCustomer !== 'all') {
      filtered = filtered.filter(c => c.id === selectedCustomer)
    }

    return filtered.map(customer => ({
      ...customer,
      projects: customer.projects
        .filter(p => selectedProject === 'all' || p.id === selectedProject)
        .map(project => ({
          ...project,
          transactions: filterTransactionsByDate(project.transactions)
        }))
        .filter(p => p.transactions.length > 0) // Only show projects with transactions
    })).filter(c => c.projects.length > 0) // Only show customers with projects
  }, [activeCustomers, selectedCustomer, selectedProject, dateRange])

  // Calculate totals
  const totals = useMemo(() => {
    let totalDebit = 0
    let totalCredit = 0
    let transactionCount = 0

    filteredData.forEach(customer => {
      customer.projects.forEach(project => {
        project.transactions.forEach(t => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
          transactionCount++
        })
      })
    })

    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
      transactionCount
    }
  }, [filteredData])

  // Export to PDF
  const exportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.setTextColor(212, 175, 55) // Gold
      doc.text('NVH Agri System - Financial Report', 14, 22)
      
      // Date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
      if (dateRange.from || dateRange.to) {
        doc.text(`Period: ${dateRange.from || 'Start'} to ${dateRange.to || 'End'}`, 14, 38)
      }

      // Summary
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Summary', 14, 48)
      
      const summaryData = [
        ['Total Debit', `₹${totals.totalDebit.toLocaleString()}`],
        ['Total Credit', `₹${totals.totalCredit.toLocaleString()}`],
        ['Net Balance', `₹${Math.abs(totals.balance).toLocaleString()} (${totals.balance >= 0 ? 'Profit' : 'Loss'})`],
        ['Total Transactions', totals.transactionCount.toString()]
      ]

      autoTable(doc, {
        startY: 52,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55] },
      })

      // Customer Breakdown
      let yPos = doc.lastAutoTable.finalY + 15
      
      filteredData.forEach((customer, index) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(212, 175, 55)
        doc.text(customer.full_name, 14, yPos)
        yPos += 8

        customer.projects.forEach(project => {
          if (yPos > 250) {
            doc.addPage()
            yPos = 20
          }

          doc.setFontSize(12)
          doc.setTextColor(255, 255, 255)
          doc.text(project.name, 20, yPos)
          yPos += 6

          const transactionData = project.transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.description || '-',
            t.type !== 'investment' ? `₹${t.debit_amount}` : '-',
            t.type === 'investment' ? `₹${t.credit_amount}` : '-',
          ])

          autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Type', 'Description', 'Debit', 'Credit']],
            body: transactionData,
            theme: 'striped',
            headStyles: { fillColor: [212, 175, 55] },
            margin: { left: 20 },
          })

          yPos = doc.lastAutoTable.finalY + 10
        })

        yPos += 10
      })

      doc.save(`nvh-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Generate and export financial reports</p>
        </div>
        <Button 
          onClick={exportToPDF}
          disabled={isExporting || filteredData.length === 0}
          className="bg-[#D4AF37] text-[#0A100A] hover:bg-[#C6A032] disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Generating PDF...' : 'Export PDF'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                From Date
              </label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                To Date
              </label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Customer
              </label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F1A] border-[#D4AF37]/30 text-white">
                  <SelectItem value="all">All Customers</SelectItem>
                  {activeCustomers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FolderTree className="w-4 h-4 inline mr-1" />
                Project
              </label>
              <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject}
                disabled={selectedCustomer === 'all'}
              >
                <SelectTrigger className="bg-black/50 border-[#D4AF37]/30 text-white">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F1A] border-[#D4AF37]/30 text-white">
                  <SelectItem value="all">All Projects</SelectItem>
                  {availableProjects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCustomer !== 'all' || selectedProject !== 'all' || dateRange.from || dateRange.to) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCustomer('all')
                  setSelectedProject('all')
                  setDateRange({ from: '', to: '' })
                }}
                className="text-gray-400 hover:text-[#D4AF37]"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Debit</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  ₹{totals.totalDebit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Credit</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  ₹{totals.totalCredit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Net Balance</p>
                <p className={`text-2xl font-bold mt-1 ${totals.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(totals.balance).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                <DollarSign className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {totals.transactionCount}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Data Message */}
      {filteredData.length === 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found for the selected filters</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your date range or selecting different customers</p>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      {filteredData.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#D4AF37]" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredData.map(customer => (
                <div key={customer.id} className="border border-[#D4AF37]/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-3">{customer.full_name}</h3>
                  
                  {customer.projects.map(project => (
                    <div key={project.id} className="mb-4 last:mb-0">
                      <h4 className="text-white font-medium mb-2">{project.name}</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[#1A1F1A]">
                            <tr>
                              <th className="text-left py-2 px-3 text-gray-400">Date</th>
                              <th className="text-left py-2 px-3 text-gray-400">Type</th>
                              <th className="text-left py-2 px-3 text-gray-400">Description</th>
                              <th className="text-right py-2 px-3 text-gray-400">Debit (₹)</th>
                              <th className="text-right py-2 px-3 text-gray-400">Credit (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.transactions.map(t => (
                              <tr key={t.id} className="border-b border-[#D4AF37]/10">
                                <td className="py-2 px-3 text-gray-300">{formatDate(t.date)}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    t.type === 'investment' 
                                      ? 'bg-purple-500/20 text-purple-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-gray-300">{t.description || '-'}</td>
                                <td className="py-2 px-3 text-right text-red-400">
                                  {t.type !== 'investment' ? `₹${t.debit_amount}` : '-'}
                                </td>
                                <td className="py-2 px-3 text-right text-green-400">
                                  {t.type === 'investment' ? `₹${t.credit_amount}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}