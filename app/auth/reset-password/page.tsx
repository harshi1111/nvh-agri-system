'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, AlertCircle, Leaf } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // IMPORTANT: Supabase automatically handles the token from URL
    // We just need to wait for the session to be established
    const handleSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        setError('Invalid or expired reset link')
        return
      }

      if (!session) {
        // If no session, redirect to login
        router.push('/login')
      }
    }

    handleSession()
  }, [router, supabase])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 mb-4">
            <Leaf className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400 mt-2">Enter your new password</p>
        </div>

        <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-sm text-green-400">{message}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4AF37] text-[#0A100A] font-medium rounded-xl hover:bg-[#C6A032] transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}