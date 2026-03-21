export type Project = {
  id: string
  customer_id: string
  name: string
  type: 'plot' | 'acre'          // 👈 NEW: type of project
  acres: number | null            // kept for compatibility, not used in new system
  country: string
  state: string | null
  district: string | null
  city: string | null
  village: string | null
  status: 'active' | 'completed' | 'on hold'
  created_at: string
}