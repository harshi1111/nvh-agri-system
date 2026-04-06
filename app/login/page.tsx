'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Wheat } from 'lucide-react'
import DemoWalkthrough from '@/components/DemoWalkthrough';
export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isFarmerHover, setIsFarmerHover] = useState(false)
  const [birdFlying, setBirdFlying] = useState(false)
  const [birdPath, setBirdPath] = useState({ x: 0, y: 0, rotation: 0 })
  const [showSecretBird, setShowSecretBird] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [particles, setParticles] = useState<Array<{ left: string; top: string; animationDelay: string; animationDuration: number }>>([])

  // Generate particles only on client
  useEffect(() => {
    const particlesArray = []
    for (let i = 0; i < 3; i++) {
      particlesArray.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: 8 + Math.random() * 4
      })
    }
    setParticles(particlesArray)
  }, [])

  // Secret bird appears briefly when hovering over field
  useEffect(() => {
    if (!birdFlying) {
      const timer = setTimeout(() => setShowSecretBird(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [showSecretBird, birdFlying])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const button = document.getElementById('enter-field-button')
    if (button) {
      const rect = button.getBoundingClientRect()
      
      // Bird starts from hidden position in the field
      const fieldX = window.innerWidth * 0.3
      const fieldY = window.innerHeight * 0.7
      
      setBirdPath({ x: fieldX, y: fieldY, rotation: 0 })
      setBirdFlying(true)
      
      // Fly to button first (comes to greet)
      setTimeout(() => {
        setBirdPath({ x: rect.left + rect.width/2, y: rect.top - 20, rotation: 10 })
      }, 300)
      
      // Then take off toward dashboard
      setTimeout(() => {
        const animateFlight = (progress: number) => {
          const startX = rect.left + rect.width/2
          const startY = rect.top - 20
          const currentX = startX + (window.innerWidth * 0.7 * progress)
          const currentY = startY - 100 * Math.sin(progress * Math.PI)
          const rotation = -10 + (30 * progress)
          
          setBirdPath({ x: currentX, y: currentY, rotation })
          
          if (progress < 1) {
            requestAnimationFrame(() => animateFlight(progress + 0.02))
          } else {
            performLogin()
          }
        }
        
        setTimeout(() => animateFlight(0), 500)
      }, 800)
    }
  }

  const performLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      setBirdFlying(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://nvhagrigreen.qzz.io/auth/reset-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the reset link!')
      setTimeout(() => setResetMode(false), 3000)
    }
    setLoading(false)
  }

  // Auto-fill demo credentials on demo site
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
      setEmail('demo@example.com');
      setPassword('demo123');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden flex items-center justify-center p-4">
      {process.env.NEXT_PUBLIC_IS_DEMO === 'true' && <DemoWalkthrough />}
      {/* Enhanced Background - Dawn Field with Depth */}
      <div className="absolute inset-0">
        {/* Far distance - faint birds already in the sky */}
        <div className="absolute top-20 left-1/4 opacity-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={`far-bird-${i}`}
              className="absolute"
              style={{
                left: `${i * 30}px`,
                top: `${Math.sin(i) * 10}px`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#D4AF37]/30">
                <path d="M2 10 L6 6 L10 10 L6 14 L2 10" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
          ))}
        </div>
        
        {/* Horizon Line */}
        <div className="absolute bottom-1/3 left-0 right-0 h-32 bg-gradient-to-t from-[#1A2A1A] to-transparent"></div>
        
        {/* Rows of Crops - Animated */}
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
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Secret bird hiding in field - appears briefly on hover */}
        {showSecretBird && !birdFlying && (
          <div 
            className="absolute transition-opacity duration-500"
            style={{
              left: '30%',
              bottom: '25%',
              opacity: 0.3,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 14 C 14 14, 15 15, 15 16 C 15 17, 14 18, 12 18 C 10 18, 9 17, 9 16 C 9 15, 10 14, 12 14" 
                fill="#D4AF37" 
                fillOpacity="0.2"
                stroke="#D4AF37" 
                strokeWidth="1"
              />
            </svg>
          </div>
        )}

        {/* Rising Sun Effect */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        
        {/* Morning Mist */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/50 pointer-events-none"></div>
      </div>

      {/* THE BIRD - Flies when called */}
      {birdFlying && (
        <div 
          className="absolute z-20 pointer-events-none"
          style={{
            left: birdPath.x,
            top: birdPath.y,
            transform: `translate(-50%, -50%) rotate(${birdPath.rotation}deg)`,
            filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.2))',
            transition: 'all 0.05s linear',
          }}
        >
          {/* Aesthetic bird silhouette */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path 
              d="M18 10 C 22 10, 26 12, 26 16 C 26 20, 22 22, 18 22 C 14 22, 10 20, 10 16 C 10 12, 14 10, 18 10" 
              fill="#1A2A1A" 
              stroke="#D4AF37" 
              strokeWidth="1.5"
              className="animate-birdBreathing"
            />
            <path 
              d="M22 14 L 28 10 L 26 14 L 28 18 L 22 14" 
              fill="#0A120A" 
              stroke="#D4AF37" 
              strokeWidth="1"
              className="animate-birdWing"
            />
            <path 
              d="M14 14 L 8 10 L 10 14 L 8 18 L 14 14" 
              fill="#0A120A" 
              stroke="#D4AF37" 
              strokeWidth="1"
              className="animate-birdWing2"
            />
            <circle cx="22" cy="15" r="1.2" fill="#D4AF37" />
            <path d="M26 16 L 30 15 L 26 17" fill="#D4AF37" />
          </svg>
          
          {/* Golden trail */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full"
                style={{
                  animation: `trailFade 0.6s ease-out ${i * 0.08}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card with Subtle Paper Texture */}
      <div className="relative w-full max-w-sm z-10 group/card">
        
        {/* Subtle glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>
        
        {/* Card with paper texture */}
        <div 
          className="relative bg-[#0F180F]/90 backdrop-blur-sm border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
          onMouseEnter={() => setShowSecretBird(true)}
        >
          {/* Paper grain texture */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}></div>
          
          {/* Floating particles - now rendered only after client side generation */}
          {particles.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((particle, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-[#D4AF37]/20 rounded-full"
                  style={{
                    left: particle.left,
                    top: particle.top,
                    animation: `floatParticle ${particle.animationDuration}s linear infinite`,
                    animationDelay: particle.animationDelay,
                  }}
                />
              ))}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-4 relative">
            <div 
              className="relative inline-block mb-2 group/logo"
              onMouseEnter={() => setIsFarmerHover(true)}
              onMouseLeave={() => setIsFarmerHover(false)}
            >
              <div className={`absolute inset-0 bg-[#D4AF37]/20 rounded-full transition-all duration-500 ${isFarmerHover ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}></div>
              
              <div className="relative w-12 h-12 mx-auto bg-gradient-to-br from-[#1A2A1A] to-[#0A120A] rounded-full border border-[#D4AF37] flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover/logo:scale-110">
                <Wheat className={`w-5 h-5 text-[#D4AF37] transition-all duration-300 ${isFarmerHover ? 'rotate-12' : ''}`} />
              </div>
              
              {isFarmerHover && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4AF37] rounded-full animate-ping"></div>
              )}
            </div>
            
            <h1 className="text-xl font-bold text-white">
              <span className="text-[#D4AF37]">NVH</span> Agri
            </h1>
            
            {/* FARMING MANAGEMENT SYSTEM - Now brighter and visible */}
            <p className="text-[10px] font-medium  text-gray-400 mt-0.5 tracking-wider">
              FARMING MANAGEMENT SYSTEM
            </p>
            
            {/* மண் • நீர் • வெயில் - Now brighter and visible */}
            <p className="text-[9px] font-medium text-[#D4AF37] mt-1">
              மண் • நீர் • வெயில்
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400 text-center">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Reset Mode or Login Mode */}
          {resetMode ? (
            // Password Reset Form
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">email for reset</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-[#D4AF37]/30 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#D4AF37] text-[#0A120A] text-sm font-medium rounded-lg hover:bg-[#C6A032] transition-colors"
              >
                {loading ? 'sending...' : 'send reset link'}
              </button>

              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-xs text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                ← back to login
              </button>
            </form>
          ) : (
            // Login Form
            <>
              <form onSubmit={handleEmailLogin} className="space-y-3">
                
                {/* Farmer ID */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">farmer ID</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-black/40 border border-[#D4AF37]/30 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Passcode */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">passcode</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-black/40 border border-[#D4AF37]/30 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer group/check">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#D4AF37]"
                    />
                    <span className="text-xs text-gray-400 group-hover/check:text-[#D4AF37]/70 transition-colors">remember</span>
                  </label>
                  
                  {/* Forgot button - NOW WORKING */}
                  <button 
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs text-[#D4AF37] hover:text-[#C6A032] transition-colors relative group/forgot"
                  >
                    forgot?
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#D4AF37] group-hover/forgot:w-full transition-all duration-300"></span>
                  </button>
                </div>

                {/* Submit Button */}
                <div className="relative mt-2">
                  <button
                    id="enter-field-button"
                    type="submit"
                    disabled={loading || birdFlying}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="relative w-full py-2.5 bg-[#D4AF37] text-[#0A120A] text-sm font-medium rounded-lg overflow-hidden group/btn disabled:opacity-50"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-[#C6A032] to-[#D4AF37] transform transition-transform duration-500 ${isHovering && !birdFlying ? 'translate-x-0' : '-translate-x-full'}`}></div>
                    
                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                      {loading || birdFlying ? (
                        <>
                          <span>bird is flying</span>
                          <span className="animate-bounce">✨</span>
                        </>
                      ) : (
                        <>
                          <span>enter the field</span>
                          <span className={`transform transition-all duration-300 ${isHovering ? 'translate-x-1' : ''}`}>→</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="text-center mt-4 pt-3 border-t border-[#D4AF37]/10">
            <p className="text-[9px] text-gray-600">NVH Agri Green • since 2024</p>
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
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes birdBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes birdWing {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          50% { transform: rotate(-10deg) translate(-2px, -1px); }
        }
        @keyframes birdWing2 {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          50% { transform: rotate(10deg) translate(2px, -1px); }
        }
        @keyframes trailFade {
          0% { transform: translateX(0) scale(1); opacity: 0.6; }
          100% { transform: translateX(-20px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
