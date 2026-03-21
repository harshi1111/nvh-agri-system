export type Plot = {
  id: string
  project_id: string
  type: 'plot' | 'acre'
  plot_number: string | null
  cent: number | null
  acre_number: string | null
  acre: number | null
  created_at: string
}

export type PlotTransaction = {
  id: string
  plot_id: string
  sequence_number: number
  date: string
  type: 'labour' | 'sprinkler' | 'transport' | 'food' | 'ploughing' | 'tractor' | 'dung' | 'investment'
  amount: number
  description: string
  count?: number | null
}