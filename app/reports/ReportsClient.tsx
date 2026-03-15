'use client'

import { useState, useMemo, useEffect } from 'react'
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
  ChevronRight
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

// Add missing interfaces
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
  email: string | null
  address: string | null
  is_active: boolean
  projects: Project[]
}

interface ReportsClientProps {
  customers: Customer[]
  totalCount: number
  currentPage: number
  pageSize: number
}

export default function ReportsClient({ 
  customers, 
  totalCount, 
  currentPage, 
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
  const [birdVisible, setBirdVisible] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  const activeCustomers = useMemo(() => customers, [customers])

  const availableProjects = useMemo(() => {
    if (selectedCustomer === 'all') return []
    const customer = activeCustomers.find(c => c.id === selectedCustomer)
    return customer?.projects || []
  }, [activeCustomers, selectedCustomer])

  const filterTransactionsByDate = (transactions: Transaction[]) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      if (dateRange.from && new Date(dateRange.from) > transactionDate) return false
      if (dateRange.to && new Date(dateRange.to) < transactionDate) return false
      return true
    })
  }

  const filteredData = useMemo(() => {
    let filtered = [...activeCustomers]
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
        .filter(p => p.transactions.length > 0)
    })).filter(c => c.projects.length > 0)
  }, [activeCustomers, selectedCustomer, selectedProject, dateRange])

  const summary = useMemo(() => {
    let totalDebit = 0, totalCredit = 0, txnCount = 0
    filteredData.forEach(c => {
      c.projects.forEach(p => {
        p.transactions.forEach(t => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
          txnCount++
        })
      })
    })
    return { totalDebit, totalCredit, balance: totalCredit - totalDebit, txnCount }
  }, [filteredData])

  const exportToPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      doc.setFontSize(22)
      doc.setTextColor(180, 140, 40)
      doc.text('NVH Agri Green – Financial Report', 14, 22)
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
      let yPos = 40

      doc.setFontSize(14)
      doc.setTextColor(180, 140, 40)
      doc.text('Summary', 14, yPos)
      yPos += 8

      const summaryData = [
        ['Total Debit', `₹${summary.totalDebit.toLocaleString()}`],
        ['Total Credit', `₹${summary.totalCredit.toLocaleString()}`],
        ['Net Balance', `₹${Math.abs(summary.balance).toLocaleString()} (${summary.balance >= 0 ? 'Profit' : 'Loss'})`],
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

      filteredData.forEach((customer) => {
        if (yPos > 250) { doc.addPage(); yPos = 20 }
        doc.setFontSize(14); doc.setTextColor(180, 140, 40)
        doc.text(customer.full_name, 14, yPos); yPos += 8
        customer.projects.forEach(project => {
          if (yPos > 250) { doc.addPage(); yPos = 20 }
          doc.setFontSize(12); doc.setTextColor(212, 175, 55)
          doc.text(project.name, 20, yPos); yPos += 6
          const transactionData = project.transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.description || '-',
            t.type !== 'investment' ? `₹${t.debit_amount}` : '-',
            t.type === 'investment' ? `₹${t.credit_amount}` : '-',
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
        yPos += 10
      })
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
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      {/* Background – you can add the full golden hour background here if needed */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#4A3A2A] to-transparent"></div>
        {/* ... rest of background ... */}
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
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all">
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F1A] border-[#d4af37]/30">
                    <SelectItem value="all">All Customers</SelectItem>
                    {activeCustomers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <FolderTree className="w-3 h-3" /> Project
                </Label>
                <Select value={selectedProject} onValueChange={setSelectedProject} disabled={selectedCustomer === 'all'}>
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

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> From
                </Label>
                <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> To
                </Label>
                <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="bg-black/40 border-[#d4af37]/30 text-white h-9 hover:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all" />
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

              <Button onClick={handleExport} disabled={isExporting || filteredData.length === 0} className="w-full bg-[#d4af37] text-[#0A120A] hover:bg-[#e5c158] disabled:opacity-50 gap-2 mt-2 transition-all hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating...' : `Export ${format.toUpperCase()}`}
              </Button>

              {(selectedCustomer !== 'all' || selectedProject !== 'all' || dateRange.from || dateRange.to) && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomer('all'); setSelectedProject('all'); setDateRange({ from: '', to: '' }); }} className="w-full text-gray-400 hover:text-[#d4af37] text-xs transition-colors">
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>

          {filteredData.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-2 border-[#d4af37]/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <CardContent className="p-3">
                <h3 className="text-xs font-medium text-[#d4af37] mb-2 flex items-center gap-1">
                  <PieChart className="w-3 h-3" /> Summary
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Debit</p>
                    <p className="text-xs font-semibold text-[#f2a385]">₹{summary.totalDebit.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Credit</p>
                    <p className="text-xs font-semibold text-[#93ba97]">₹{summary.totalCredit.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-[#d4af37]/20">
                    <p className="text-[9px] text-gray-400">Balance</p>
                    <p className={`text-xs font-semibold ${summary.balance >= 0 ? 'text-[#93ba97]' : 'text-[#f2a385]'}`}>
                      ₹{Math.abs(summary.balance).toLocaleString()}
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
          {filteredData.length === 0 ? (
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
                  <span className="text-xs text-gray-500 ml-2">({filteredData.length} customers)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20">
                <div className="space-y-4">
                  {filteredData.map(customer => (
                    <div key={customer.id} className="border border-[#d4af37]/20 rounded-lg p-3 bg-black/20">
                      <h3 className="text-sm font-semibold text-[#d4af37] mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {customer.full_name}
                      </h3>
                      {customer.projects.map(project => (
                        <div key={project.id} className="mb-3 last:mb-0">
                          <h4 className="text-sm text-white font-medium mb-2 ml-1 flex items-center gap-1">
                            <FolderTree className="w-3 h-3 text-[#d4af37]" /> {project.name}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-black/60">
                                <tr>
                                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Date</th>
                                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Type</th>
                                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Description</th>
                                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Debit (₹)</th>
                                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Credit (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {project.transactions.map(t => (
                                  <tr key={t.id} className="border-b border-[#d4af37]/10 hover:bg-[#d4af37]/5 transition-colors">
                                    <td className="py-2 px-3 text-gray-300 whitespace-nowrap text-sm">
                                      {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        t.type === 'investment' 
                                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      }`}>
                                        {t.type}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-gray-300 max-w-[200px] truncate text-sm" title={t.description || '-'}>
                                      {t.description || '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right text-[#f2a385] whitespace-nowrap text-sm">
                                      {t.type !== 'investment' ? `₹${t.debit_amount}` : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right text-[#93ba97] whitespace-nowrap text-sm">
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
              disabled={currentPage === 1}
              className="border-[#d4af37]/30 text-[#d4af37]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
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
        /* If you need additional keyframes like sway, sunset, etc., add them here */
      `}</style>
    </div>
  )
}