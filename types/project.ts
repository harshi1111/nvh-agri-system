export type Project = {
  id: string
  customer_id: string
  name: string
  acres: number | null
  country: string
  state: string | null
  district: string | null
  village: string | null
  status: 'active' | 'completed' | 'on hold'
  created_at: string
}