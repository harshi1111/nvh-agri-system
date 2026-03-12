'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F0A]">
      <div className="glass-card-premium w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Set New Password</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30">
            {error}
          </div>
        )}
        <form onSubmit={handleReset}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}