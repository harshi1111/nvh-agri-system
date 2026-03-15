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
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import CustomerFormModal from '@/components/CustomerFormModal'
import EditCustomerModal from '@/components/EditCustomerModal'
import DeleteCustomerModal from '@/components/DeleteCustomerModal'
import AadhaarIcon from '@/components/AadhaarIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import Link from 'next/link'

interface CustomersClientProps {
  initialCustomers: Customer[]
  totalCount: number
  currentPage: number
}

const PAGE_SIZE = 20

export default function CustomersClient({ 
  initialCustomers, 
  totalCount,
  currentPage: initialPage 
}: CustomersClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [birdVisible, setBirdVisible] = useState(true)
  
  // Pagination state
  const [customers, setCustomers] = useState(initialCustomers)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [archiveCount, setArchiveCount] = useState(0)

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Bird disappears after flying across
  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

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

  // Fetch customers for specific page
  const fetchPage = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers?page=${page}&pageSize=${PAGE_SIZE}`)
      const data = await response.json()
      setCustomers(data.customers)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter customers based on search (client-side filtering on current page)
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_number.includes(searchTerm) ||
      (customer.aadhaar_number && customer.aadhaar_number.includes(searchTerm))
    
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
    fetchPage(currentPage)
  }

  const handleCustomerDeleted = () => {
    router.refresh()
    fetchPage(1)
    fetch('/api/archive-count')
      .then(res => res.json())
      .then(data => setArchiveCount(data.count))
      .catch(console.error)
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 space-y-4 animate-fade-in">
      
      {/* ========== LOGIN PAGE BACKGROUND ========== */}
      <div className="absolute inset-0">
        {/* Horizon Line */}
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        
        {/* Rows of Crops - Animated */}
        <div className="absolute bottom-1/3 left-0 right-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-full h-16"
              style={{
                left: `${i * 10}%`,
                transform: `translateY(${Math.sin(i) * 5}px)`,
              }}
            >
              <div className="relative">
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-1 bg-[#D4AF37]/30"
                    style={{
                      left: `${j * 8}px`,
                      height: '20px',
                      bottom: '0',
                      transform: `rotate(${Math.sin(j + i) * 10}deg)`,
                      animation: `sway ${3 + j}s ease-in-out infinite`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rising Sun Effect */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        
        {/* Morning Mist */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/50 pointer-events-none"></div>

        {/* Animated particles – FIXED POSITIONS */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: '15%', top: '20%', delay: '0s' },
            { left: '85%', top: '30%', delay: '2s' },
            { left: '45%', top: '70%', delay: '1s' },
            { left: '70%', top: '15%', delay: '3s' },
            { left: '25%', top: '85%', delay: '2.5s' },
            { left: '90%', top: '60%', delay: '1.5s' },
            { left: '10%', top: '45%', delay: '4s' },
            { left: '55%', top: '90%', delay: '0.5s' },
            { left: '30%', top: '35%', delay: '5s' },
            { left: '75%', top: '75%', delay: '3.5s' },
            { left: '40%', top: '50%', delay: '4.5s' },
            { left: '95%', top: '10%', delay: '2.2s' },
            { left: '5%', top: '95%', delay: '1.2s' },
            { left: '60%', top: '40%', delay: '6s' },
            { left: '20%', top: '60%', delay: '5.5s' },
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#D4AF37]/30 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float-particle ${15 + i * 2}s linear infinite`,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Flying Bird */}
      {birdVisible && (
        <div className="fixed top-1/4 left-0 z-50 pointer-events-none animate-bird-fly">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path 
              d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" 
              fill="#1a2a1a" 
              stroke="#d4af37" 
              strokeWidth="1.5"
            />
            <path 
              d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" 
              fill="#0A120A" 
              stroke="#d4af37" 
              strokeWidth="1"
              className="animate-wing"
            />
            <circle cx="16" cy="14" r="1.2" fill="#d4af37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-4">
        
        {/* Header – gold icons and button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-sm bg-black/30 p-4 rounded-2xl border border-[#d4af37]/30">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#d4af37]" />
              Customers
            </h1>
            <p className="text-sm text-[#d4af37]/80 mt-1">Manage your customer database</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#d4af37] text-[#0A120A] hover:bg-[#e5c158] transition-all font-medium shadow-lg shadow-[#d4af37]/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Customer
          </Button>
        </div>

        {/* Stats Cards – bright colored labels */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Customers – sky blue */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#8bbed6]/40 rounded-xl hover:border-[#96cbe3] transition-all group animate-slide-in" style={{ animationDelay: '0.05s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8fd1f0]">Total Customers</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalCount + archiveCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Active + Archive</p>
                </div>
                <div className="p-2 bg-[#8bbed6]/10 rounded-full group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-[#8bbed6]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active – warm carrot green */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#93ba97]/40 rounded-xl hover:border-[#93ba97] transition-all group animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#93ba97]">Active</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Currently active</p>
                </div>
                <div className="p-2 bg-[#93ba97]/10 rounded-full group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-[#93ba97]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archive – warm brown */}
          <Card 
            className="bg-black/40 backdrop-blur-sm border border-[#bf9e7a]/40 rounded-xl hover:border-[#bf9e7a] transition-all cursor-pointer group animate-slide-in" 
            style={{ animationDelay: '0.15s' }}
            onClick={() => router.push('/settings/archive')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#e86037]">In Archive</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {archiveCount}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Click to view</p>
                </div>
                <div className="p-2 bg-[#bf9e7a]/10 rounded-full group-hover:scale-110 transition-transform">
                  <XCircle className="w-5 h-5 text-[#bf9e7a]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Filter – gold accents */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-black/40 border-[#d4af37]/30 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 transition-all"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10">
                <Filter className="h-4 w-4 mr-2" />
                {filterStatus === 'all' ? 'All Active' : filterStatus === 'active' ? 'Active' : 'Archived'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1F1A] border-[#d4af37]/30 text-white">
              <DropdownMenuItem onClick={() => setFilterStatus('all')} className="hover:bg-[#d4af37]/20">
                All Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')} className="hover:bg-[#d4af37]/20">
                Active Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFilterStatus('inactive')
                router.push('/settings/archive')
              }} className="hover:bg-[#d4af37]/20">
                View Archive →
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Card – FIX: removed backdrop-blur-sm to avoid stacking context */}
        <Card className="bg-black/40 border border-[#d4af37]/30 rounded-xl overflow-hidden hover:border-[#d4af37]/70 transition-all">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/60">
                <TableRow className="border-b border-[#d4af37]/20">
                  <TableHead className="text-gray-300 font-medium">#</TableHead>
                  <TableHead className="text-gray-300 font-medium">Name</TableHead>
                  <TableHead className="text-gray-300 font-medium">Contact</TableHead>
                  <TableHead className="text-gray-300 font-medium">Aadhaar No.</TableHead>
                  <TableHead className="text-gray-300 font-medium">Status</TableHead>
                  <TableHead className="text-gray-300 font-medium">Aadhaar Card</TableHead>
                  <TableHead className="text-right text-gray-300 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[#d4af37] mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-600" />
                        <p className="text-gray-500">No customers found.</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsAddModalOpen(true)}
                          className="mt-2 border-[#d4af37]/30 text-[#d4af37]"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Customer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer, index) => {
                    const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1
                    return (
                      <TableRow 
                        key={customer.id} 
                        className="border-b border-[#d4af37]/10 hover:bg-[#d4af37]/5 transition-colors"
                      >
                        <TableCell className="text-gray-500 font-mono text-sm">{globalIndex}</TableCell>
                        {/* Name column – terracotta */}
                        <TableCell className="font-medium text-[#f2a385]">{customer.full_name}</TableCell>
                        {/* Contact – teal */}
                        <TableCell className="text-[#65c5dd]">{customer.contact_number}</TableCell>
                        {/* Aadhaar – teal as well */}
                        <TableCell className="font-mono text-[#bd9cf0]">{customer.aadhaar_number}</TableCell>
                        <TableCell>
                          <Badge className="bg-[#93ba97]/20 text-[#5dc467] border border-[#93ba97]/30 rounded-full px-3 py-0.5 text-xs">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-start">
                            <AadhaarIcon 
                              customerId={customer.id}
                              existingImages={customer.aadhaar_images || []}
                              onImagesUpdated={() => router.refresh()}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#d4af37]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1A1F1A] border-[#d4af37]/30 text-white">
                              <Link href={`/customers/${customer.id}`} prefetch={true} passHref>
                                <DropdownMenuItem className="hover:bg-[#d4af37]/20 cursor-pointer"> 
                                  <Eye className="mr-2 h-4 w-4 text-[#d4af37]" /> View
                                </DropdownMenuItem>
                               </Link>
                              <DropdownMenuItem 
                                onClick={() => handleEditClick(customer)}
                                className="hover:bg-[#d4af37]/20"
                              >
                                <Edit className="mr-2 h-4 w-4 text-[#d4af37]" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(customer)}
                                className="text-[#f2a385] hover:bg-[#f2a385]/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-[#f2a385]" /> Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination – gold accents */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="h-8 border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPage(pageNum)}
                      disabled={isLoading}
                      className={`h-8 w-8 ${currentPage === pageNum ? 'bg-[#d4af37] text-[#0A120A] border-[#d4af37]' : 'border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10'}`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
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

      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes sunrise {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
      `}</style>
    </div>
  )
}