'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Download,
  AlertCircle,
  Shield,
  CheckCircle,
  Archive,
  ArrowRight,
  Settings,
  FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ExportToExcelButton from '@/components/ExportToExcelButton'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [birdVisible, setBirdVisible] = useState(true)
  const [excelData, setExcelData] = useState([])
  const [loadingExcel, setLoadingExcel] = useState(false)
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: ''
  })
  
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || ''
        })
      }
    }
    loadProfile()
  }, [supabase])

  // Fetch data for Excel export
  const fetchExcelData = async () => {
    setLoadingExcel(true)
    setMessage(null)
    try {
      console.log("Starting Excel data fetch...")
      
      const { data, error, status } = await supabase
        .from('plot_transactions')
        .select(`
          *,
          plot:plot_id (
            name,
            project:project_id (
              name,
              customer:customer_id (
                full_name
              )
            )
          )
        `)
        .order('date', { ascending: false })

      console.log("Supabase response status:", status)
      console.log("Raw data count:", data?.length)

      if (error) {
        console.error("Supabase error:", error)
        setMessage({ type: 'error', text: `Database error: ${error.message}` })
        setExcelData([])
        return
      }

      if (!data || data.length === 0) {
        console.log("No transactions found in plot_transactions table")
        setMessage({ type: 'error', text: 'No transactions found to export. Add some transactions first.' })
        setExcelData([])
        return
      }

      const formattedData = data?.map((item: any) => ({
        'Date': item.date || 'N/A',
        'Customer': item.plot?.project?.customer?.full_name || 'N/A',
        'Project': item.plot?.project?.name || 'N/A',
        'Plot': item.plot?.name || 'N/A',
        'Description': item.description || '-',
        'Debit (₹)': item.debit_amount || 0,
        'Credit (₹)': item.credit_amount || 0,
        'Serial No': item.sequence_number || 'N/A',
      })) || []

      console.log("Formatted data count:", formattedData.length)
      setExcelData(formattedData)
      setMessage({ type: 'success', text: `${formattedData.length} transactions ready to export` })
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: 'Failed to load data for export' })
    } finally {
      setLoadingExcel(false)
    }
  }

  // Load Excel data when component mounts
  useEffect(() => {
    fetchExcelData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: profile.full_name }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setUser(data.user)
      router.refresh()
    }
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password changed successfully! Please log in again.' })
      setPasswords({ new: '', confirm: '' })
      
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backup')
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nvh-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/50 pointer-events-none"></div>

        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: '15%', top: '20%', delay: '0s' },
            { left: '85%', top: '30%', delay: '2s' },
            { left: '45%', top: '70%', delay: '1s' },
            { left: '70%', top: '15%', delay: '3s' },
            { left: '25%', top: '85%', delay: '2.5s' },
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-[#D4AF37]/20 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float-particle 15s linear infinite`,
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
              d="M10 14 C 14 12, 18 12, 22 14 C 18 20, 16 20, 12 18 C 10 16, 10 14, 10 14" 
              fill="#1A2A1A" 
              stroke="#D4AF37" 
              strokeWidth="1.5"
            />
            <path 
              d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" 
              fill="#0A120A" 
              stroke="#D4AF37" 
              strokeWidth="1"
              className="animate-wing"
            />
            <circle cx="16" cy="14" r="1.2" fill="#D4AF37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-[#D4AF37]" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Profile & Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Profile Card */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl overflow-hidden transition-all hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="group">
                  <label className="block text-xs text-gray-400 mb-1 group-focus-within:text-[#D4AF37] transition-colors">
                    Full Name
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="bg-black/50 border-[#D4AF37]/30 text-white h-8 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-black/50 border-[#D4AF37]/30 text-gray-400 cursor-not-allowed h-8 text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="sm"
                  className="w-full bg-[#D4AF37] text-[#0A120A] hover:bg-[#e5c158] text-xs h-7"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl overflow-hidden transition-all hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="group">
                  <label className="block text-xs text-gray-400 mb-1 group-focus-within:text-[#D4AF37] transition-colors">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    required
                    className="bg-black/50 border-[#D4AF37]/30 text-white h-8 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Minimum 6 chars"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs text-gray-400 mb-1 group-focus-within:text-[#D4AF37] transition-colors">
                    Confirm
                  </label>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    className="bg-black/50 border-[#D4AF37]/30 text-white h-8 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Re‑enter"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="sm"
                  className="w-full bg-[#D4AF37] text-[#0A120A] hover:bg-[#e5c158] text-xs h-7"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Backup, Excel Export, Archive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Backup Card */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl overflow-hidden transition-all hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                Backup & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-xs text-gray-400 mb-3">
                Download a complete backup of your data.
              </p>
              <Button 
                onClick={handleBackup}
                variant="outline"
                size="sm"
                className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 justify-between text-xs h-8"
              >
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Download Backup
                </span>
                <span className="text-[10px] text-gray-500">.json</span>
              </Button>
            </CardContent>
          </Card>

          {/* Excel Export Card */}
          <Card className="bg-black/40 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl overflow-hidden transition-all hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
                Excel Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-xs text-gray-400 mb-3">
                Download all transactions as Excel/CSV file.
              </p>
              {loadingExcel ? (
                <div className="text-center text-gray-400 text-xs py-2">Loading data...</div>
              ) : (
                <ExportToExcelButton 
                  data={excelData} 
                  fileName={`nvh_transactions_${new Date().toISOString().slice(0,10)}`}
                  buttonText={`📊 Download Excel (.csv) ${excelData.length > 0 ? `(${excelData.length})` : ''}`}
                />
              )}
            </CardContent>
          </Card>

          {/* Archive Card */}
          <div 
            className="group relative bg-gradient-to-br from-[#D4AF37]/5 to-transparent border-2 border-[#D4AF37]/30 rounded-xl p-4 cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all overflow-hidden"
            onClick={() => router.push('/settings/archive')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/10 rounded-full group-hover:scale-110 transition-transform">
                  <Archive className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Archive</h3>
                  <p className="text-xs text-gray-400">View and restore deleted customers</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
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
        @keyframes bird-fly {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { transform: translateX(30vw) translateY(-10px); }
          60% { transform: translateX(60vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); opacity: 1; }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        @keyframes wing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
