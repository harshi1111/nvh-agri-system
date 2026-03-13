'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/types/customers'
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import CustomerFormModal from '@/components/CustomerFormModal'
import EditCustomerModal from '@/components/EditCustomerModal'
import DeleteCustomerModal from '@/components/DeleteCustomerModal'
import AadhaarIcon from '@/components/AadhaarIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // State for archive count
  const [archiveCount, setArchiveCount] = useState(0)

  // Fetch archive count on mount and after updates
  useEffect(() => {
    const fetchArchiveCount = async () => {
      try {
        const response = await fetch('/api/archive-count')
        const data = await response.json()
        setArchiveCount(data.count)
      } catch (error) {
        console.error('Failed to fetch archive count:', error)
      }
    }
    
    fetchArchiveCount()
  }, [])

  // Filter customers based on search and status
  const filteredCustomers = initialCustomers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_number.includes(searchTerm) ||
      (customer.aadhaar_number && customer.aadhaar_number.includes(searchTerm))
    
    if (filterStatus === 'inactive') {
      return false
    }
    
    return matchesSearch
  })

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const handleCustomerUpdated = () => {
    router.refresh()
  }

  const handleCustomerDeleted = () => {
    router.refresh()
    fetch('/api/archive-count')
      .then(res => res.json())
      .then(data => setArchiveCount(data.count))
      .catch(console.error)
  }

  return (
    <div className="p-6 space-y-6 bg-[#0A0F0A] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#F5F5F0]">Customers</h1>
          <p className="text-gray-400 mt-1">Manage your customer database</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn-gold"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card-premium border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Customers</CardTitle>
            <Users className="h-5 w-5 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {initialCustomers.length + archiveCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active + In Archive</p>
          </CardContent>
        </Card>

        <Card className="glass-card-premium border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
            <CheckCircle className="h-5 w-5 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4AF37]">
              {initialCustomers.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card 
          className="glass-card-premium border-0 cursor-pointer hover:border-[#D4AF37]/30 transition-colors"
          onClick={() => router.push('/settings/archive')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">In Archive</CardTitle>
            <XCircle className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">
              {archiveCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Click to view archive</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search active customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-gold pl-12"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-[rgba(212,175,55,0.3)] text-[#D4AF37] bg-transparent hover:bg-[#D4AF37]/10 rounded-full px-6">
              <Filter className="h-4 w-4 mr-2" />
              {filterStatus === 'all' ? 'Active Customers' : filterStatus === 'active' ? 'Active' : 'In Archive'}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="bg-[#1A1F1A] border-[rgba(212,175,55,0.3)] text-white">
            <DropdownMenuItem onClick={() => setFilterStatus('all')} className="hover:bg-[#D4AF37]/20">
              Active Customers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')} className="hover:bg-[#D4AF37]/20">
              Active Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setFilterStatus('inactive')
              router.push('/settings/archive')
            }} className="hover:bg-[#D4AF37]/20">
              View In Archive →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card className="glass-card border-0 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#1A1F1A]">
              <TableRow className="border-b border-[rgba(212,175,55,0.2)]">
                <TableHead className="text-gray-300 w-16">S.No</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Contact</TableHead>
                <TableHead className="text-gray-300">Aadhaar No.</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Aadhaar Card</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-gray-600" />
                      <p>No active customers found.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-2 border-[#D4AF37]/30 text-[#D4AF37]"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add your first customer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <TableRow 
                    key={customer.id} 
                    className="border-b border-[rgba(212,175,55,0.1)] hover:bg-[#D4AF37]/5"
                  >
                    <TableCell className="text-gray-400 font-mono">{index + 1}</TableCell>
                    <TableCell className="font-medium text-white">{customer.full_name}</TableCell>
                    <TableCell className="text-gray-300">{customer.contact_number}</TableCell>
                    <TableCell className="font-mono text-gray-300">{customer.aadhaar_number}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#D4AF37] text-[#0A0F0A] rounded-full px-3 py-1">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AadhaarIcon 
                        customerId={customer.id}
                        existingImages={customer.aadhaar_images || []}
                        onImagesUpdated={() => router.refresh()}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#D4AF37] rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1A1F1A] border-[rgba(212,175,55,0.3)]">
                          <DropdownMenuItem 
                            onClick={() => router.push(`/customers/${customer.id}`)}
                            className="text-white hover:bg-[#D4AF37]/20"
                          >
                            <Eye className="mr-2 h-4 w-4 text-[#D4AF37]" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditClick(customer)}
                            className="text-white hover:bg-[#D4AF37]/20"
                          >
                            <Edit className="mr-2 h-4 w-4 text-[#D4AF37]" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(customer)}
                            className="text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Move to Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomerFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {selectedCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedCustomer(null)
          }}
          customer={selectedCustomer}
          onCustomerUpdated={handleCustomerUpdated}
        />
      )}

      {selectedCustomer && (
        <DeleteCustomerModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedCustomer(null)
          }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.full_name}
          onDeleted={handleCustomerDeleted}
        />
      )}
    </div>
  )
}