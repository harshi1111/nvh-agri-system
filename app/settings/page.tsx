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
  Bell,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: ''
  })
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // Load user profile on mount
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
      // Update local user state
      setUser(data.user)
      // Refresh the page to update sidebar greeting
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
      setPasswords({ current: '', new: '', confirm: '' })
      
      // Sign out after 2 seconds to force re-login with new password
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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#D4AF37]" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                value={profile.email}
                disabled
                className="bg-black/50 border-[#D4AF37]/30 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#D4AF37] text-[#0A100A] hover:bg-[#C6A032]"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#D4AF37]" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Re-enter new password"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#D4AF37] text-[#0A100A] hover:bg-[#C6A032]"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Backup & Safety */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            Backup & Safety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <p className="text-sm text-gray-400">
              Download a complete backup of all your data. Keep this file safe!
            </p>
            <Button 
              onClick={handleBackup}
              variant="outline"
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
            
            <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                Safety Tips
              </h4>
              <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                <li>Download a backup before making major changes</li>
                <li>Store backups in at least two different places</li>
                <li>Keep backups for different dates</li>
                <li>Test restoring from backup occasionally</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}