'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import { FaEnvelope, FaLock } from 'react-icons/fa'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F0A]">
      <div className="glass-card-premium w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">nvhFlow</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30">
            {error}
          </div>
        )}

        {resetSent && (
          <div className="mb-4 p-3 bg-green-900/30 text-green-300 rounded-lg text-sm border border-green-500/30">
            Password reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-[#D4AF37]/30 rounded-full pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#D4AF37]/30 rounded-full pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={handleForgotPassword}
            className="text-[#D4AF37] hover:underline"
          >
            Forgot password?
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37]"
          >
            <FcGoogle className="text-xl" />
            <span>Google</span>
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing in, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}