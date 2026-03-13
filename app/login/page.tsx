'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FcGoogle } from 'react-icons/fc'
import { Mail, Lock, AlertCircle, Leaf } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [resetMode, setResetMode] = useState(false)

  // Handle Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the password reset link!')
      setTimeout(() => setResetMode(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 mb-4">
            <Leaf className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to your NVH Agri account</p>
        </div>

        {/* Card */}
        <div className="bg-[#0A100A] border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-sm text-green-400">{message}</p>
            </div>
          )}

          {/* Reset Mode or Login Mode */}
          {resetMode ? (
            // Password Reset Form
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#D4AF37] text-[#0A100A] font-medium rounded-xl hover:bg-[#C6A032] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            // Login Form
            <>
              <form onSubmit={handleEmailLogin} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-black/50 border border-[#D4AF37]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-sm text-[#D4AF37] hover:text-[#C6A032] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#D4AF37] text-[#0A100A] font-medium rounded-xl hover:bg-[#C6A032] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D4AF37]/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A100A] text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <FcGoogle className="w-5 h-5" />
                <span>Google</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 NVH Agri Systems. All rights reserved.
        </p>
      </div>
    </div>
  )
}