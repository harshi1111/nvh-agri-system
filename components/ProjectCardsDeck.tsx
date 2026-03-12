'use client'

import { useState, useRef, useEffect } from 'react'
import { Project } from '@/types/project'
import { ChevronLeft, ChevronRight, MapPin, Ruler } from 'lucide-react'

interface ProjectCardsDeckProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
  onAddClick: () => void
}

export default function ProjectCardsDeck({ projects, onProjectClick, onAddClick }: ProjectCardsDeckProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftArrow(container.scrollLeft > 20)
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 20
      )
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [projects])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 400
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      // Check scroll position after animation
      setTimeout(checkScroll, 300)
    }
  }

  // Get location preview (state/district/village)
  const getLocationPreview = (project: Project) => {
    const parts = []
    if (project.village) parts.push(project.village)
    if (project.district) parts.push(project.district)
    if (project.state) parts.push(project.state)
    return parts.join(', ') || 'Location not set'
  }

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="relative w-full py-6 group">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0A100A]/80 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A100A] transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#0A100A]/80 border border-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A100A] transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Cards Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 pb-4 px-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add Project Card */}
        <button
          onClick={onAddClick}
          className="flex-none w-80 h-48 border-2 border-dashed border-[#D4AF37]/40 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20">
            <span className="text-2xl text-[#D4AF37]">+</span>
          </div>
          <span className="text-[#D4AF37] font-medium">Add New Project</span>
        </button>

        {/* Project Cards */}
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectClick(project)}
            className="flex-none w-80 bg-gradient-to-br from-[#0A100A] to-[#1A251A] border border-[#D4AF37]/20 rounded-xl p-5 text-left hover:border-[#D4AF37]/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all group/card"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-white group-hover/card:text-[#D4AF37] transition-colors line-clamp-1">
                {project.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            {/* Acres */}
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Ruler className="w-4 h-4" />
              <span className="text-sm">{project.acres ? `${project.acres} acres` : 'Acres not set'}</span>
            </div>

            {/* Location Preview */}
            <div className="flex items-start gap-2 text-gray-400">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm line-clamp-2">{getLocationPreview(project)}</span>
            </div>

            {/* Bottom Indicator */}
            <div className="mt-4 pt-3 border-t border-[#D4AF37]/10 flex justify-between items-center text-xs text-gray-500">
              <span>Click to view details</span>
              <span className="text-[#D4AF37] group-hover/card:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}