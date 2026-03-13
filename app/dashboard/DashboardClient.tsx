'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FolderTree, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardClientProps {
  customers: any[]
  recentTransactions: any[]
}

export default function DashboardClient({ customers, recentTransactions }: DashboardClientProps) {
  const router = useRouter()

  // Calculate stats
  const stats = useMemo(() => {
    let totalProjects = 0
    let totalDebit = 0
    let totalCredit = 0
    let activeProjects = 0

    customers.forEach(customer => {
      totalProjects += customer.projects?.length || 0
      customer.projects?.forEach((project: any) => {
        if (project.status === 'active') activeProjects++
        project.transactions?.forEach((t: any) => {
          totalDebit += t.debit_amount || 0
          totalCredit += t.credit_amount || 0
        })
      })
    })

    return {
      totalCustomers: customers.length,
      totalProjects,
      activeProjects,
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit
    }
  }, [customers])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your business</p>
        </div>
        <Button 
          onClick={() => router.push('/customers')}
          className="bg-[#D4AF37] text-[#0A100A] hover:bg-[#C6A032]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Customers</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <Link href="/customers" className="text-xs text-[#D4AF37] hover:text-[#C6A032] mt-4 inline-flex items-center">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Projects</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalProjects}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeProjects} active</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <FolderTree className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  ₹{stats.totalCredit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Net Balance</p>
                <p className={`text-3xl font-bold mt-1 ${stats.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(stats.balance).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                <DollarSign className="w-6 h-5 text-[#D4AF37]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-0 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
          onClick={() => router.push('/customers')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 rounded-full">
              <Users className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-medium">Manage Customers</h3>
              <p className="text-sm text-gray-400">Add, edit, or view customers</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] ml-auto" />
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
          onClick={() => router.push('/accounting')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 rounded-full">
              <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-medium">View Accounting</h3>
              <p className="text-sm text-gray-400">Check financial summaries</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] ml-auto" />
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
          onClick={() => router.push('/reports')}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 rounded-full">
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-white font-medium">Generate Reports</h3>
              <p className="text-sm text-gray-400">Export financial data</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] ml-auto" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Recent Transactions</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/accounting')}
              className="text-[#D4AF37] hover:text-[#C6A032]"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No transactions yet. Add your first transaction in a project.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-[#D4AF37]/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-white">
                        {t.projects?.customers?.full_name} - {t.projects?.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.description || t.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${t.credit_amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {t.credit_amount > 0 ? '+' : '-'} ₹{(t.credit_amount || t.debit_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                        {new Date(t.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customers.slice(0, 5).map(customer => {
                const activeProjects = customer.projects?.filter((p: any) => p.status === 'active') || []
                if (activeProjects.length === 0) return null
                
                return (
                  <div key={customer.id} className="flex justify-between items-center">
                    <span className="text-gray-300">{customer.full_name}</span>
                    <span className="text-[#D4AF37] font-medium">{activeProjects.length} active</span>
                  </div>
                )
              })}
              {customers.every((c: any) => c.projects?.filter((p: any) => p.status === 'active').length === 0) && (
                <p className="text-gray-400 text-sm">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/customers')}
                className="border-[#D4AF37]/30 text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
              >
                <Users className="w-4 h-4 mr-2" />
                Customers
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/accounting')}
                className="border-[#D4AF37]/30 text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Accounting
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/reports')}
                className="border-[#D4AF37]/30 text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/settings/archive')}
                className="border-[#D4AF37]/30 text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]"
              >
                <FolderTree className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}