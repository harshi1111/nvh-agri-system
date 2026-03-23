'use client'

import { useState, useMemo } from 'react'
import { X, TrendingUp, TrendingDown, PieChart, Calendar, ArrowUpRight, ArrowDownRight, Users, FolderTree, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface RevenueExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  revenue: number
  expenses: number
  customers: any[]
}

export default function RevenueExpenseModal({ isOpen, onClose, revenue, expenses, customers }: RevenueExpenseModalProps) {
  const [selectedTab, setSelectedTab] = useState<'revenue' | 'expenses'>('revenue')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const total = revenue + expenses
  const profit = revenue - expenses
  const profitMargin = total > 0 ? (profit / total) * 100 : 0

  // Get ALL customers with their revenue/expense data (NO FILTERING)
  const customerData = useMemo(() => {
    return customers.map(customer => {
      let totalCredit = 0
      let totalDebit = 0
      const projectData: any[] = []
      
      customer.projects?.forEach((project: any) => {
        let projectCredit = 0
        let projectDebit = 0
        const transactionsByType: Record<string, number> = {}
        
        project.transactions?.forEach((t: any) => {
          const credit = t.credit_amount || 0
          const debit = t.debit_amount || 0
          
          totalCredit += credit
          totalDebit += debit
          projectCredit += credit
          projectDebit += debit
          
          const type = t.type || (t.description?.split(' ')[0] || 'Other')
          if (credit > 0) {
            transactionsByType[type] = (transactionsByType[type] || 0) + credit
          }
        })
        
        // Include project even with zero transactions
        projectData.push({
          id: project.id,
          name: project.name,
          revenue: projectCredit,
          expenses: projectDebit,
          profit: projectCredit - projectDebit,
          transactionTypes: Object.entries(transactionsByType).sort((a, b) => b[1] - a[1])
        })
      })
      
      return {
        id: customer.id,
        name: customer.full_name,
        revenue: totalCredit,
        expenses: totalDebit,
        profit: totalCredit - totalDebit,
        projects: projectData.sort((a, b) => b.revenue - a.revenue)
      }
    })
    // REMOVED the filter - show ALL customers
  }, [customers])

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customerData
    return customerData.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [customerData, searchTerm])

  const getCategoryData = (type: 'credit' | 'debit') => {
    const categories: Record<string, number> = {}
    
    customers.forEach(customer => {
      customer.projects?.forEach((project: any) => {
        project.transactions?.forEach((t: any) => {
          const amount = type === 'credit' ? t.credit_amount : t.debit_amount
          if (amount > 0) {
            const category = t.type || (t.description?.split(' ')[0] || 'Other')
            categories[category] = (categories[category] || 0) + amount
          }
        })
      })
    })
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }

  const revenueData = getCategoryData('credit')
  const expenseData = getCategoryData('debit')

  const selectedCustomerData = selectedCustomer !== 'all' 
    ? customerData.find(c => c.id === selectedCustomer) 
    : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-gradient-to-br from-[#0F180F] to-[#1A241A] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border-2 border-[#D4AF37]/30 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-[#0A120A] flex-shrink-0">
          <div className="flex items-center gap-3">
            <PieChart className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl font-semibold text-white">Revenue & Expenses</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#D4AF37]/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Customer Selection Dropdown - Gold Theme */}
        <div className="p-5 pb-0 flex-shrink-0">
          <div className="bg-gradient-to-r from-[#D4AF37]/5 to-transparent rounded-xl p-4 border border-[#D4AF37]/30">
            <label className="block text-sm font-medium text-[#D4AF37] mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Select Customer for Detailed View
            </label>
            <div className="flex gap-3">
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="flex-1 bg-[#1A241A] border-2 border-[#D4AF37]/40 rounded-lg px-4 py-2.5 text-[#D4AF37] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition-all duration-300"
              >
                <option value="all" className="bg-[#0A120A] text-[#D4AF37]">All Customers (Overview)</option>
                {filteredCustomers.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0A120A] text-white">{c.name}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/50" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2.5 bg-[#1A241A] border-2 border-[#D4AF37]/40 rounded-lg text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-all duration-300 w-48"
                />
              </div>
              {selectedCustomer !== 'all' && (
                <button
                  onClick={() => setSelectedCustomer('all')}
                  className="px-3 py-2 text-xs text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 rounded-lg hover:bg-[#D4AF37]/20 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredCustomers.length} of {customerData.length} customers
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-5 flex-shrink-0">
          <div className="bg-gradient-to-br from-[#7AA65A]/10 to-transparent border border-[#7AA65A]/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-xs text-gray-400">Total Revenue</p>
            <p className="text-xl font-bold text-[#7AA65A]">₹{revenue.toLocaleString()}</p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-green-400 mt-1">
              <ArrowUpRight className="w-3 h-3" /> {((revenue / total) * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#B85C3A]/10 to-transparent border border-[#B85C3A]/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-xs text-gray-400">Total Expenses</p>
            <p className="text-xl font-bold text-[#B85C3A]">₹{expenses.toLocaleString()}</p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-red-400 mt-1">
              <ArrowDownRight className="w-3 h-3" /> {((expenses / total) * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
            <p className="text-xs text-gray-400">Net Profit</p>
            <p className={`text-xl font-bold ${profit >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>
              ₹{Math.abs(profit).toLocaleString()}
            </p>
            <div className={`flex items-center justify-center gap-1 text-[10px] mt-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {profitMargin.toFixed(1)}% margin
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 pt-0 custom-scrollbar">
          {selectedCustomer !== 'all' && selectedCustomerData ? (
            <div className="space-y-4">
              {/* Customer Header */}
              <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-xl p-4 border border-[#D4AF37]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedCustomerData.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Revenue & Expense Breakdown</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Net Balance</p>
                    <p className={`text-lg font-bold ${selectedCustomerData.profit >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>
                      ₹{Math.abs(selectedCustomerData.profit).toLocaleString()}
                      <span className="text-xs ml-1">{selectedCustomerData.profit >= 0 ? 'Profit' : 'Loss'}</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-[#D4AF37]/20">
                  <div>
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-xl font-bold text-[#7AA65A]">₹{selectedCustomerData.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Expenses</p>
                    <p className="text-xl font-bold text-[#B85C3A]">₹{selectedCustomerData.expenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Projects Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-[#D4AF37] mb-3 flex items-center gap-2">
                  <FolderTree className="w-4 h-4" />
                  Projects ({selectedCustomerData.projects.length})
                </h4>
                <div className="space-y-3">
                  {selectedCustomerData.projects.map(project => (
                    <div key={project.id} className="bg-black/30 rounded-xl border border-[#D4AF37]/20 overflow-hidden">
                      <button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FolderTree className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-white font-medium">{project.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Revenue</p>
                            <p className="text-sm font-semibold text-[#7AA65A]">₹{project.revenue.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Expenses</p>
                            <p className="text-sm font-semibold text-[#B85C3A]">₹{project.expenses.toLocaleString()}</p>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="text-xs text-gray-400">Profit</p>
                            <p className={`text-sm font-semibold ${project.profit >= 0 ? 'text-[#7AA65A]' : 'text-[#B85C3A]'}`}>
                              ₹{Math.abs(project.profit).toLocaleString()}
                            </p>
                          </div>
                          {expandedProject === project.id ? (
                            <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
                          )}
                        </div>
                      </button>
                      
                      {expandedProject === project.id && (
                        <div className="p-4 pt-0 border-t border-[#D4AF37]/20">
                          <p className="text-xs text-[#D4AF37] mb-3">Revenue by Transaction Type</p>
                          {project.transactionTypes.length === 0 ? (
                            <p className="text-xs text-gray-500">No revenue transactions</p>
                          ) : (
                            <div className="space-y-2">
                              {project.transactionTypes.map(([type, amount]: [string, number]) => {
                                const percentage = project.revenue > 0 ? (amount / project.revenue) * 100 : 0
                                return (
                                  <div key={type}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-300 capitalize">{type}</span>
                                      <span className="text-[#7AA65A]">₹{amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-[#1A241A] rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-[#7AA65A] to-[#93BA77] rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 border-b border-[#D4AF37]/20 mb-4">
                <button
                  onClick={() => setSelectedTab('revenue')}
                  className={`px-4 py-2 text-sm font-medium transition-all relative ${
                    selectedTab === 'revenue' 
                      ? 'text-[#7AA65A]' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Revenue Breakdown
                  {selectedTab === 'revenue' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7AA65A] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('expenses')}
                  className={`px-4 py-2 text-sm font-medium transition-all relative ${
                    selectedTab === 'expenses' 
                      ? 'text-[#B85C3A]' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Expenses Breakdown
                  {selectedTab === 'expenses' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B85C3A] rounded-full" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {selectedTab === 'revenue' ? (
                  revenueData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No revenue data available</div>
                  ) : (
                    revenueData.map(([category, amount]) => {
                      const percentage = (amount / revenue) * 100
                      return (
                        <div key={category} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 capitalize">{category}</span>
                            <span className="text-[#7AA65A] font-medium">₹{amount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-[#1A241A] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#7AA65A] to-[#93BA77] rounded-full transition-all duration-500 group-hover:opacity-80"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{percentage.toFixed(1)}% of total revenue</p>
                        </div>
                      )
                    })
                  )
                ) : (
                  expenseData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No expense data available</div>
                  ) : (
                    expenseData.map(([category, amount]) => {
                      const percentage = (amount / expenses) * 100
                      return (
                        <div key={category} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 capitalize">{category}</span>
                            <span className="text-[#B85C3A] font-medium">₹{amount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-[#1A241A] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#B85C3A] to-[#D47B5A] rounded-full transition-all duration-500 group-hover:opacity-80"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{percentage.toFixed(1)}% of total expenses</p>
                        </div>
                      )
                    })
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/20 bg-[#0A120A] flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            {selectedCustomer !== 'all' && selectedCustomerData
              ? `Detailed breakdown for ${selectedCustomerData.name} • ${selectedCustomerData.projects.length} projects • Last updated ${new Date().toLocaleDateString()}`
              : `Global breakdown by transaction type • ${customerData.length} customers • Last updated ${new Date().toLocaleDateString()}`
            }
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1A241A;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C6A032;
        }
      `}</style>
    </div>
  )
}