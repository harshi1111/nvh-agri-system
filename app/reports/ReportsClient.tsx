'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Download, 
  Calendar, 
  Users, 
  FolderTree,
  FileText,
  PieChart,
  Sparkles,
  Sun,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2
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
import { Label } from '@/components/ui/label'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Transaction {
  id: string
  date: string
  transaction_type_id?: number
  debit_amount: number
  credit_amount: number
  description: string | null
  type?: string
}

interface Project {
  id: string
  name: string
  status: string
  acres: number | null
  transactions: Transaction[]
  totals?: { debit: number; credit: number }
}

interface Customer {
  id: string
  full_name: string
  contact_number: string
  email: string | null
  address: string | null
  projects: Project[]
  totals?: { debit: number; credit: number }
}

interface ReportsClientProps {
  customers: Customer[]
  totalCount: number
  currentPage: number
  pageSize: number
}

// Map transaction type ID to name
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

// Consistent date formatter to prevent hydration mismatch
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Consistent number formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN').format(amount)
}

export default function ReportsClient({ 
  customers: initialCustomers, 
  totalCount: initialTotalCount, 
  currentPage: initialPage, 
  pageSize 
}: ReportsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [birdVisible, setBirdVisible] = useState(true)
  const [daysFilter, setDaysFilter] = useState<number | null>(null)
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers || [])
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0)
  const [currentPage, setCurrentPage] = useState(initialPage || 1)
  const [allCustomers, setAllCustomers] = useState<Customer[]>(initialCustomers || [])

  // Fetch ALL customers for dropdown on mount
  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const response = await fetch('/api/customers?pageSize=1000')
        const data = await response.json()
        if (data.customers) {
          setAllCustomers(data.customers)
        }
      } catch (error) {
        console.error('Error fetching all customers:', error)
        // Fallback to initial customers
        setAllCustomers(initialCustomers)
      }
    }
    fetchAllCustomers()
  }, [initialCustomers])

  // Fetch data when filters change
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('pageSize', pageSize.toString())
      if (selectedCustomer !== 'all') params.set('customerId', selectedCustomer)
      if (selectedProject !== 'all') params.set('projectId', selectedProject)
      if (dateRange.from) params.set('fromDate', dateRange.from)
      if (dateRange.to) params.set('toDate', dateRange.to)
      
      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()
      
      // Transform transactions with type names
      const transformedCustomers = data.customers?.map((customer: any) => ({
        ...customer,
        projects: customer.projects?.map((project: any) => ({
          ...project,
          transactions: project.transactions?.map((t: any) => ({
            ...t,
            type: idToTypeMap[t.transaction_type_id] || 'unknown'
          })) || []
        })) || []
      })) || []
      
      setCustomers(transformedCustomers)
      setTotalCount(data.totalCount || 0)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setCustomers([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, selectedCustomer, selectedProject, dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  const availableProjects = useMemo(() => {
    if (selectedCustomer === 'all' || !customers || customers.length === 0) return []
    const customer = customers.find(c => c.id === selectedCustomer)
    return customer?.projects || []
  }, [customers, selectedCustomer])

  const summary = useMemo(() => {
    let totalDebit = 0, totalCredit = 0, txnCount = 0
    if (!customers || customers.length === 0) return { totalDebit, totalCredit, balance: 0, txnCount: 0 }
    
    customers.forEach(c => {
      if (c.projects) {
        c.projects.forEach(p => {
          if (p.transactions) {
            p.transactions.forEach(t => {
              totalDebit += t.debit_amount || 0
              totalCredit += t.credit_amount || 0
              txnCount++
            })
          }
        })
      }
    })
    return { totalDebit, totalCredit, balance: totalCredit - totalDebit, txnCount }
  }, [customers])

  const setQuickRange = (days: number) => {
    const today = new Date()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - days)
    setDateRange({
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    })
    setDaysFilter(days)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCustomer('all')
    setSelectedProject('all')
    setDateRange({ from: '', to: '' })
    setDaysFilter(null)
    setCurrentPage(1)
  }

  const exportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      doc.setFontSize(22)
      doc.setTextColor(180, 140, 40)
      doc.text('NVH Agri Green – Financial Report', 14, 22)
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 14, 32)
      let yPos = 40

      doc.setFontSize(14)
      doc.setTextColor(180, 140, 40)
      doc.text('Summary', 14, yPos)
      yPos += 8

      const summaryData = [
        ['Total Debit', `₹${formatCurrency(summary.totalDebit)}`],
        ['Total Credit', `₹${formatCurrency(summary.totalCredit)}`],
        ['Net Balance', `₹${formatCurrency(Math.abs(summary.balance))} (${summary.balance >= 0 ? 'Profit' : 'Loss'})`],
        ['Transaction Count', summary.txnCount.toString()]
      ]

      autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [180, 140, 40] },
        bodyStyles: { textColor: [212, 175, 55] },
        alternateRowStyles: { fillColor: [30, 30, 30] },
        margin: { left: 14 },
      })

      yPos = doc.lastAutoTable.finalY + 15

      if (customers && customers.length > 0) {
        customers.forEach((customer) => {
          if (yPos > 250) { doc.addPage(); yPos = 20 }
          doc.setFontSize(14); doc.setTextColor(180, 140, 40)
          doc.text(customer.full_name, 14, yPos); yPos += 8
          if (customer.projects) {
            customer.projects.forEach(project => {
              if (yPos > 250) { doc.addPage(); yPos = 20 }
              doc.setFontSize(12); doc.setTextColor(212, 175, 55)
              doc.text(project.name, 20, yPos); yPos += 6
              const transactionData = (project.transactions || []).map(t => [
                formatDate(t.date),
                t.type,
                t.description || '-',
                t.type !== 'investment' ? `₹${formatCurrency(t.debit_amount)}` : '-',
                t.type === 'investment' ? `₹${formatCurrency(t.credit_amount)}` : '-',
              ])
              autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Type', 'Description', 'Debit (₹)', 'Credit (₹)']],
                body: transactionData,
                theme: 'striped',
                headStyles: { fillColor: [180, 140, 40] },
                bodyStyles: { textColor: [212, 175, 55] },
                alternateRowStyles: { fillColor: [30, 30, 30] },
                margin: { left: 20 },
              })
              yPos = doc.lastAutoTable.finalY + 10
            })
          }
          yPos += 10
        })
      }
      doc.save(`nvh-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = () => {
    if (format === 'pdf') exportToPDF()
    else alert('Excel export will be available soon.')
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const goToPage = (page: number) => {
    setCurrentPage(page)
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#4A3A2A] to-transparent"></div>
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" fill="#1a2a1a" stroke="#d4af37" strokeWidth="1.5"/>
            <path d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" fill="#0A120A" stroke="#d4af37" strokeWidth="1" className="animate-wing"/>
            <circle cx="16" cy="14" r="1.2" fill="#d4af37"/>
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT COLUMN – FILTERS */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#d4af37]/20 rounded-full">
                  <Sun className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Reports</h1>
                  <p className="text-xs text-[#d4af37]/70">business intelligence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-sm font-medium text-[#d4af37] flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Filters
              </h2>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Customer
                </Label>
                <Select value={selectedCustomer} onValueChange={(val) => {
                  setSelectedCustomer(val)
                  setSelectedProject('all')
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all">
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F1A] border-[#d4af37]/30">
                    <SelectItem value="all">All Customers</SelectItem>
                    {allCustomers && allCustomers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <FolderTree className="w-3 h-3" /> Project
                </Label>
                <Select value={selectedProject} onValueChange={(val) => {
                  setSelectedProject(val)
                  setCurrentPage(1)
                }} disabled={selectedCustomer === 'all'}>
                  <SelectTrigger className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all disabled:opacity-50">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F1A] border-[#d4af37]/30">
                    <SelectItem value="all">All Projects</SelectItem>
                    {availableProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Range Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Quick Range
                </Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuickRange(7)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                      daysFilter === 7 
                        ? 'bg-[#D4AF37] text-black font-medium' 
                        : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                    }`}
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => setQuickRange(30)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                      daysFilter === 30 
                        ? 'bg-[#D4AF37] text-black font-medium' 
                        : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                    }`}
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => setQuickRange(90)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                      daysFilter === 90 
                        ? 'bg-[#D4AF37] text-black font-medium' 
                        : 'bg-black/40 text-gray-400 hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                    }`}
                  >
                    Last 90 days
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> From
                </Label>
                <Input 
                  type="date" 
                  value={dateRange.from} 
                  onChange={(e) => {
                    setDateRange({ ...dateRange, from: e.target.value })
                    setDaysFilter(null)
                    setCurrentPage(1)
                  }} 
                  className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> To
                </Label>
                <Input 
                  type="date" 
                  value={dateRange.to} 
                  onChange={(e) => {
                    setDateRange({ ...dateRange, to: e.target.value })
                    setDaysFilter(null)
                    setCurrentPage(1)
                  }} 
                  className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Format</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm text-white cursor-pointer group">
                    <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="accent-[#d4af37] w-3.5 h-3.5" />
                    <span className="group-hover:text-[#d4af37] transition">PDF</span>
                  </label>
                  <label className="flex items-center gap-1 text-sm text-white cursor-pointer group">
                    <input type="radio" name="format" value="excel" checked={format === 'excel'} onChange={() => setFormat('excel')} className="accent-[#d4af37] w-3.5 h-3.5" />
                    <span className="group-hover:text-[#d4af37] transition">Excel</span>
                  </label>
                </div>
              </div>

              <Button onClick={handleExport} disabled={isExporting || !customers || customers.length === 0} className="w-full bg-[#d4af37] text-[#0A120A] hover:bg-[#e5c158] disabled:opacity-50 gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating...' : `Export ${format.toUpperCase()}`}
              </Button>

              {(selectedCustomer !== 'all' || selectedProject !== 'all' || dateRange.from || dateRange.to) && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full text-gray-400 hover:text-[#d4af37] text-xs transition-colors">
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>

          {customers && customers.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <CardContent className="p-3">
                <h3 className="text-xs font-medium text-[#d4af37] mb-2 flex items-center gap-1">
                  <PieChart className="w-3 h-3" /> Summary
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Debit</p>
                    <p className="text-xs font-semibold text-[#f2a385]" suppressHydrationWarning>
                      ₹{formatCurrency(summary.totalDebit)}
                    </p>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Credit</p>
                    <p className="text-xs font-semibold text-[#93ba97]" suppressHydrationWarning>
                      ₹{formatCurrency(summary.totalCredit)}
                    </p>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Balance</p>
                    <p className={`text-xs font-semibold ${summary.balance >= 0 ? 'text-[#93ba97]' : 'text-[#f2a385]'}`} suppressHydrationWarning>
                      ₹{formatCurrency(Math.abs(summary.balance))}
                    </p>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Txns</p>
                    <p className="text-xs font-semibold text-white">{summary.txnCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN – PREVIEW TABLE */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl h-full">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading reports...</p>
              </CardContent>
            </Card>
          ) : !customers || customers.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl h-full">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
                <p className="text-sm text-gray-500 mt-2">Adjust your filters</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <PieChart className="w-5 h-5 text-[#d4af37]" />
                  Report Preview
                  <span className="text-xs text-gray-500 ml-2">({customers.length} customers)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20">
                <div className="space-y-4">
                  {customers.map(customer => (
                    <div key={customer.id} className="border border-[#d4af37]/20 rounded-lg p-3 bg-black/20 hover:bg-[#d4af37]/5 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-[#d4af37] flex items-center gap-1">
                          <Users className="w-3 h-3" /> {customer.full_name}
                        </h3>
                        <div className="flex gap-2 text-xs">
                          <span className="text-[#7AA65A]">₹{formatCurrency(customer.projects?.reduce((sum, p) => sum + (p.transactions?.reduce((s, t) => s + t.credit_amount, 0) || 0), 0) || 0)}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-[#B85C3A]">₹{formatCurrency(customer.projects?.reduce((sum, p) => sum + (p.transactions?.reduce((s, t) => s + t.debit_amount, 0) || 0), 0) || 0)}</span>
                        </div>
                      </div>
                      {customer.projects && customer.projects.map(project => (
                        <div key={project.id} className="mb-3 last:mb-0 ml-4">
                          <h4 className="text-xs text-white font-medium mb-2 flex items-center gap-1">
                            <FolderTree className="w-3 h-3 text-[#d4af37]" /> {project.name}
                            <span className="text-[10px] text-gray-500 ml-2">
                              ({project.transactions?.length || 0} transactions)
                            </span>
                          </h4>
                          {project.transactions && project.transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-black/60">
                                  <tr className="text-gray-400">
                                    <th className="text-left py-1.5 px-2">Date</th>
                                    <th className="text-left py-1.5 px-2">Type</th>
                                    <th className="text-left py-1.5 px-2">Description</th>
                                    <th className="text-right py-1.5 px-2">Debit (₹)</th>
                                    <th className="text-right py-1.5 px-2">Credit (₹)</th>
                                   </tr>
                                </thead>
                                <tbody>
                                  {project.transactions.slice(0, 5).map(t => (
                                    <tr key={t.id} className="border-b border-[#d4af37]/10 hover:bg-[#d4af37]/10 transition-colors">
                                      <td className="py-1.5 px-2 text-gray-300 whitespace-nowrap" suppressHydrationWarning>
                                        {formatDate(t.date)}
                                      </td>
                                      <td className="py-1.5 px-2">
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                          t.type === 'investment' 
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                          {t.type}
                                        </span>
                                      </td>
                                      <td className="py-1.5 px-2 text-gray-400 max-w-[150px] truncate" title={t.description || '-'}>
                                        {t.description || '-'}
                                      </td>
                                      <td className="py-1.5 px-2 text-right text-[#f2a385]" suppressHydrationWarning>
                                        {t.type !== 'investment' ? `₹${formatCurrency(t.debit_amount)}` : '-'}
                                      </td>
                                      <td className="py-1.5 px-2 text-right text-[#93ba97]" suppressHydrationWarning>
                                        {t.type === 'investment' ? `₹${formatCurrency(t.credit_amount)}` : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {project.transactions.length > 5 && (
                                <p className="text-[10px] text-gray-500 text-center mt-1">+ {project.transactions.length - 5} more transactions</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-500 italic ml-2">No transactions in this period</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 max-w-7xl mx-auto px-4">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages} (Total customers: {totalCount})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="border-[#d4af37]/30 text-[#d4af37]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="border-[#d4af37]/30 text-[#d4af37]"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bird-fly {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { transform: translateX(30vw) translateY(-10px); }
          60% { transform: translateX(60vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); opacity: 1; }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        @keyframes wing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1A241A;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}