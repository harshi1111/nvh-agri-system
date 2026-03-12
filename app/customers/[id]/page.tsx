import { getProjectsByCustomer } from '@/lib/actions/projects'
import { getCustomerById } from '@/lib/actions/customers'
import CustomerDetailClient from './CustomerDetailClient'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Await the params first
  const { id } = await params

  const customer = await getCustomerById(id)
  const projects = await getProjectsByCustomer(id)

  return <CustomerDetailClient customer={customer} initialProjects={projects} />
}