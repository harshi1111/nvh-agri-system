'use client'

import { Wheat } from 'lucide-react'

interface FarmLoaderProps {
  message?: string
}

export default function FarmLoader({ message = "harvesting details" }: FarmLoaderProps) {
  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-6">
      {/* Background crops (same as login) */}
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
                    className="absolute w-1 bg-[#D4AF37]/40"
                    style={{
                      left: `${j * 8}px`,
                      height: '20px',
                      bottom: '0',
                      transform: `rotate(${Math.sin(j + i) * 10}deg)`,
                      animation: `sway 3s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated bird (hovering) */}
      <div className="absolute top-20 right-20 animate-float">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <path 
            d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" 
            fill="#1a2a1a" 
            stroke="#d4af37" 
            strokeWidth="1.5"
          />
          <circle cx="16" cy="14" r="1.2" fill="#d4af37" />
        </svg>
      </div>

      {/* Centered loading message */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-[#d4af37]/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-t-[#d4af37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <Wheat className="absolute inset-0 w-full h-full p-5 text-[#d4af37] animate-pulse" />
        </div>
        <h2 className="text-2xl font-light text-[#d4af37] tracking-widest animate-pulse">
          {message}
        </h2>
        <p className="text-sm text-gray-500 mt-2">please wait</p>

        {/* Decorative dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}