'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isValidLink, setIsValidLink] = useState(false)

  useEffect(() => {
    // THIS IS THE KEY PART - Handle the recovery token from URL
    const handleRecoveryToken = async () => {
      // Get the hash from URL (contains the recovery token)
      const hash = window.location.hash
      console.log('URL Hash:', hash) // Debug log
      
      if (hash && hash.includes('type=recovery')) {
        // Supabase automatically handles the token in the hash
        // We just need to wait for the session to be set
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError('Invalid or expired reset link')
        } else if (session) {
          console.log('Session found:', session)
          setIsValidLink(true)
        } else {
          // Try to get session again after a short delay
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            if (retrySession) {
              setIsValidLink(true)
            } else {
              setError('No active session. Please request a new reset link.')
            }
          }, 1000)
        }
      } else {
        setError('Invalid reset link. Please request a new one.')
      }
    }

    handleRecoveryToken()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session)
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsValidLink(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
      // Sign out after password reset
      await supabase.auth.signOut()
      setTimeout(() => router.push('/login'), 2000)
    }
    setLoading(false)
  }

  // Show loading or error state
  if (!isValidLink && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A120A] to-[#1A2A1A] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p>Verifying your reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A120A] to-[#1A2A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="bg-[#0F180F]/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#1A2A1A] to-[#0A120A] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your new password below</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 text-center">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="mt-3 text-xs text-[#D4AF37] hover:text-[#C6A032] block mx-auto"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Form */}
          {!message && isValidLink && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/40 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D4AF37] text-[#0A120A] font-medium rounded-xl hover:bg-[#C6A032] transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}