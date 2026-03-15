'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Customer } from '@/types/customers'
import { Project } from '@/types/project'
import { Mail, Phone, MapPin, CreditCard, Calendar, User } from 'lucide-react'
import ProjectCardsDeck from '@/components/ProjectCardsDeck'
// Remove static imports for modals
// import AddProjectModal from '@/components/AddProjectModal'
// import ProjectZoomView from '@/components/ProjectZoomView'

// Dynamically import modals with loading skeletons
const AddProjectModal = dynamic(
  () => import('@/components/AddProjectModal'),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-[#0F1A0F] to-[#1E2E1E] border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#D4AF37] text-sm">Loading project form...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

const ProjectZoomView = dynamic(
  () => import('@/components/ProjectZoomView'),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#0F1A0F] to-[#1E2E1E] border border-[#D4AF37]/30 rounded-2xl p-12 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#D4AF37] text-base">Loading project details...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

interface CustomerDetailClientProps {
  customer: Customer
  initialProjects: Project[]
}

export default function CustomerDetailClient({ customer, initialProjects }: CustomerDetailClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isZoomViewOpen, setIsZoomViewOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [birdVisible, setBirdVisible] = useState(true)

  // Bird disappears after flying across
  useEffect(() => {
    setTimeout(() => setBirdVisible(false), 8000)
  }, [])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleProjectAdded = (newProject: Project) => {
    setProjects([newProject, ...projects])
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setIsZoomViewOpen(true)
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsZoomViewOpen(true)
  }

  const handleProjectUpdated = () => {
    // Optional refresh logic
  }

  return (
    <div className="min-h-screen bg-[#0A120A] relative overflow-hidden p-4 sm:p-6 animate-fade-in">
      
      {/* ========== LOGIN PAGE BACKGROUND ========== */}
      <div className="absolute inset-0">
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

        {/* Rising Sun Effect */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl animate-sunrise"></div>
        
        {/* Morning Mist */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-[#0A120A]/50 pointer-events-none"></div>

        {/* Animated particles – fixed positions */}
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
              className="absolute w-0.5 h-0.5 bg-[#D4AF37]/30 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                animation: `float-particle ${15 + i * 2}s linear infinite`,
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
              d="M10 14 C 14 12, 18 12, 22 14 C 20 18, 16 20, 12 18 C 10 16, 10 14, 10 14" 
              fill="#1a2a1a" 
              stroke="#d4af37" 
              strokeWidth="1.5"
            />
            <path 
              d="M18 14 L 24 10 L 22 14 L 24 18 L 18 14" 
              fill="#0A120A" 
              stroke="#d4af37" 
              strokeWidth="1"
              className="animate-wing"
            />
            <circle cx="16" cy="14" r="1.2" fill="#d4af37" />
          </svg>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        
        {/* Customer Profile Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl hover:border-[#d4af37]/70 transition-all">
          <div className="flex flex-wrap gap-8">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4 min-w-[250px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border-2 border-[#d4af37]/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#d4af37]">
                  {customer.full_name?.charAt(0) || 'U'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-white">{customer.full_name}</h1>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  {/* STATUS BADGE – using warm green from dashboard */}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    customer.is_active
                      ? 'bg-[#93ba97]/20 text-[#93ba97] border border-[#93ba97]/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#d4af37]" />
                    {customer.contact_number}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE DETAILS */}
            <div className="flex-1 flex flex-wrap items-center gap-6 bg-black/30 rounded-xl p-4 border border-[#d4af37]/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm text-gray-300">{customer.aadhaar_number || 'No Aadhaar'}</span>
              </div>

              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-sm text-gray-300">{customer.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm text-gray-300">{customer.gender || 'Not specified'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm text-gray-300">
                  {customer.date_of_birth ? formatDate(customer.date_of_birth) : 'Not specified'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span className="text-sm text-gray-300">Since {formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          {customer.address && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 border-t border-[#d4af37]/10 pt-4">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>{customer.address}</span>
            </div>
          )}
        </div>

        {/* PROJECTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-[#d4af37] rounded-full"></span>
              Projects
            </h2>
          </div>

          <ProjectCardsDeck 
            projects={projects}
            onProjectClick={handleProjectClick}
            onAddClick={() => setIsAddModalOpen(true)}
          />

          {projects.length === 0 && (
            <div className="text-center py-12 bg-black/20 border border-[#d4af37]/10 rounded-xl">
              <p className="text-gray-400">No projects yet. Click "Add New Project" to create your first project.</p>
            </div>
          )}
        </div>

        {/* Modals */}
        <AddProjectModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          customerId={customer.id}
          onProjectAdded={handleProjectAdded}
          onProjectView={handleViewProject}
        />

        {selectedProject && (
          <ProjectZoomView
            isOpen={isZoomViewOpen}
            onClose={() => {
              setIsZoomViewOpen(false)
              setSelectedProject(null)
            }}
            project={selectedProject}
            onUpdate={handleProjectUpdated}
          />
        )}
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bird-fly {
          0% { transform: translateX(-200px) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { transform: translateX(30vw) translateY(-10px); }
          60% { transform: translateX(60vw) translateY(5px); }
          90% { transform: translateX(90vw) translateY(-5px); opacity: 1; }
          100% { transform: translateX(110vw) translateY(0); opacity: 0; }
        }
        @keyframes wing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-bird-fly {
          animation: bird-fly 8s ease-in-out forwards;
        }
        .animate-wing {
          animation: wing 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
      `}</style>
    </div>
  )
}