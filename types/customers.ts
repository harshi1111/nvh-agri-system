// types/customers.ts
export interface Customer {
  id: string
  full_name: string
  aadhaar_number?: string | null
  contact_number: string
  email?: string | null
  gender?: string | null
  date_of_birth?: string | null
  address?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}