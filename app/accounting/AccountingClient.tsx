'use client'

import { useState, useMemo } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FolderTree,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Transaction {
  id: string
  sequence_number: number
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
  is_active: boolean
  projects: Project[]
}

interface AccountingClientProps {
  customers: Customer[]
}

export default function AccountingClient({ customers }: AccountingClientProps) {
  const router = useRouter()
  
  // Filter states
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Get only active customers
  const activeCustomers = useMemo(() => {
    return customers.filter(c => c.is_active === true)
  }, [customers])

  // Get customers to display based on dropdown selection FIRST
  const dropdownFilteredCustomers = useMemo(() => {
    if (selectedCustomer === 'all') {
      return activeCustomers
    }
    return activeCustomers.filter(c => c.id === selectedCustomer)
  }, [activeCustomers, selectedCustomer])

  // THEN apply search filter on top of dropdown selection
  const displayedCustomers = useMemo(() => {
    return dropdownFilteredCustomers.filter(customer =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_number.includes(searchTerm)
    )
  }, [dropdownFilteredCustomers, searchTerm])

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

  // Calculate overall totals with filters
  const overallTotals = useMemo(() => {
    let totalDebit = 0
    let totalCredit = 0
    let totalProjects = 0
    let totalTransactions = 0

    displayedCustomers.forEach(customer => {
      customer.projects.forEach(project => {
        if (selectedProject !== 'all' && project.id !== selectedProject) return
        
        totalProjects++
        const filteredTransactions = filterTransactionsByDate(project.transactions)
        
        filteredTransactions.forEach(t => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
          totalTransactions++
        })
      })
    })

    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
      totalCustomers: displayedCustomers.length,
      totalProjects,
      totalTransactions
    }
  }, [displayedCustomers, selectedProject, dateRange])

  // Calculate per-customer totals with filters
  const customerTotals = useMemo(() => {
    return displayedCustomers.map(customer => {
      let debit = 0
      let credit = 0
      let projectCount = 0
      let transactionCount = 0

      customer.projects.forEach(project => {
        if (selectedProject !== 'all' && project.id !== selectedProject) return
        
        projectCount++
        const filteredTransactions = filterTransactionsByDate(project.transactions)
        
        filteredTransactions.forEach(t => {
          debit += t.debit_amount || 0
          credit += t.credit_amount || 0
          transactionCount++
        })
      })

      return {
        ...customer,
        totals: {
          debit,
          credit,
          balance: credit - debit,
          projectCount,
          transactionCount
        }
      }
    })
  }, [displayedCustomers, selectedProject, dateRange])

  // Toggle customer expansion
  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCustomer('all')
    setSelectedProject('all')
    setDateRange({ from: '', to: '' })
    setSearchTerm('')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Accounting Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time financial overview</p>
        </div>
        <Button 
          onClick={() => router.refresh()}
          variant="outline"
          className="border-[#D4AF37]/30 text-[#D4AF37]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Net Balance</p>
                <p className={`text-2xl font-bold mt-1 ${overallTotals.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(overallTotals.balance).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallTotals.balance >= 0 ? 'Profit' : 'Loss'}
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
                <p className="text-sm text-gray-400">Total Debit</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  ₹{overallTotals.totalDebit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Money spent</p>
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
                  ₹{overallTotals.totalCredit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Money invested</p>
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
                <p className="text-sm text-gray-400">Customers/Projects</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {overallTotals.totalCustomers} / {overallTotals.totalProjects}
                </p>
                <p className="text-xs text-gray-500 mt-1">{overallTotals.totalTransactions} transactions</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-[#D4AF37]"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Customer
              </label>
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectContent className="bg-[#1A1F1A] border-[#D4AF37]/30 text-white max-h-80">
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

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Breakdown */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            Customer Financial Summary
            {selectedCustomer !== 'all' && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                (Filtered by customer)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerTotals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No customers found matching your filters
              </div>
            ) : (
              customerTotals.map(customer => (
                <div key={customer.id} className="border border-[#D4AF37]/20 rounded-xl overflow-hidden">
                  {/* Customer Header */}
                  <div 
                    className="bg-[#1A1F1A] p-4 flex items-center justify-between cursor-pointer hover:bg-[#D4AF37]/5 transition-colors"
                    onClick={() => toggleCustomer(customer.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                        <span className="text-[#D4AF37] font-bold">
                          {customer.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{customer.full_name}</h3>
                        <p className="text-xs text-gray-400">{customer.contact_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Balance</p>
                        <p className={`font-semibold ${customer.totals.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₹{Math.abs(customer.totals.balance).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Projects</p>
                        <p className="text-white font-semibold">{customer.totals.projectCount}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/customers/${customer.id}`)
                        }}
                        className="text-[#D4AF37] hover:bg-[#D4AF37]/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {expandedCustomers.includes(customer.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Project Details */}
                  {expandedCustomers.includes(customer.id) && (
                    <div className="p-4 bg-black/20 space-y-4">
                      {/* Customer Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-[#1A1F1A] p-3 rounded-lg">
                          <p className="text-xs text-gray-400">Total Debit</p>
                          <p className="text-lg font-semibold text-red-400">
                            ₹{customer.totals.debit.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-[#1A1F1A] p-3 rounded-lg">
                          <p className="text-xs text-gray-400">Total Credit</p>
                          <p className="text-lg font-semibold text-green-400">
                            ₹{customer.totals.credit.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-[#1A1F1A] p-3 rounded-lg">
                          <p className="text-xs text-gray-400">Transactions</p>
                          <p className="text-lg font-semibold text-white">
                            {customer.totals.transactionCount}
                          </p>
                        </div>
                      </div>

                      {/* Projects List */}
                      <h4 className="text-sm font-medium text-[#D4AF37] mb-2">Projects</h4>
                      {customer.projects
                        .filter(p => selectedProject === 'all' || p.id === selectedProject)
                        .map(project => {
                          const filteredTransactions = filterTransactionsByDate(project.transactions)
                          
                          const projectDebit = filteredTransactions.reduce((sum, t) => sum + (t.debit_amount || 0), 0)
                          const projectCredit = filteredTransactions.reduce((sum, t) => sum + (t.credit_amount || 0), 0)
                          const projectBalance = projectCredit - projectDebit

                          return (
                            <div key={project.id} className="bg-[#1A1F1A] rounded-lg p-3 mb-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-white font-medium">{project.name}</p>
                                  <p className="text-xs text-gray-400">
                                    Status: {project.status} | {filteredTransactions.length} transactions
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-semibold ${projectBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ₹{Math.abs(projectBalance).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    D:₹{projectDebit.toLocaleString()} | C:₹{projectCredit.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Indicator */}
      {(selectedCustomer !== 'all' || selectedProject !== 'all' || dateRange.from || dateRange.to || searchTerm) && (
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>Active filters:</span>
          {searchTerm && <span className="bg-[#D4AF37]/10 px-2 py-1 rounded">Search: {searchTerm}</span>}
          {selectedCustomer !== 'all' && <span className="bg-[#D4AF37]/10 px-2 py-1 rounded">Customer: {activeCustomers.find(c => c.id === selectedCustomer)?.full_name}</span>}
          {selectedProject !== 'all' && <span className="bg-[#D4AF37]/10 px-2 py-1 rounded">Project selected</span>}
          {dateRange.from && <span className="bg-[#D4AF37]/10 px-2 py-1 rounded">From: {dateRange.from}</span>}
          {dateRange.to && <span className="bg-[#D4AF37]/10 px-2 py-1 rounded">To: {dateRange.to}</span>}
        </div>
      )}
    </div>
  )
}