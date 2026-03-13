import { getProjectsByCustomer } from '@/lib/actions/projects'
import { getCustomerById } from '@/lib/actions/customers'
import CustomerDetailClient from './CustomerDetailClient'
import { notFound } from 'next/navigation'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const customer = await getCustomerById(id)
  const projects = await getProjectsByCustomer(id)

  if (!customer) {
    notFound() // shows Next.js 404 page
  }

  return <CustomerDetailClient customer={customer} initialProjects={projects} />
}
