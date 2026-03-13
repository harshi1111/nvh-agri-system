'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Customer } from '@/types/customers'
import { Project } from '@/types/project'
import { Mail, Phone, MapPin, CreditCard, Calendar, User } from 'lucide-react'
import AddProjectModal from '@/components/AddProjectModal'
import ProjectCardsDeck from '@/components/ProjectCardsDeck'
import ProjectZoomView from '@/components/ProjectZoomView'
import AadhaarIcon from '@/components/AadhaarIcon'


interface CustomerDetailClientProps {
  customer: Customer
  initialProjects: Project[]
}

export default function CustomerDetailClient({ customer, initialProjects }: CustomerDetailClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isZoomViewOpen, setIsZoomViewOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsZoomViewOpen(true)
  }

  return (
    <div className="space-y-8">

      {/* Customer Profile */}
      <div className="bg-gradient-to-br from-[#0A100A] to-[#1A2A1A] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap gap-8">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4 min-w-[250px]">

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#D4AF37]">
                {customer.full_name?.charAt(0) || 'U'}
              </span>
            </div>

            <div>
              
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{customer.full_name}</h1>

                {/* Aadhaar Icon - This is the ONLY place for Aadhaar */}
                <AadhaarIcon 
                  customerId={customer.id}
                  existingImages={customer.aadhaar_images || []}
                  onImagesUpdated={(images) => {
                    console.log('Images updated:', images)
                  }}
                />
              </div>

              <div className="flex items-center gap-3 mt-1">

                {/* STATUS BADGE */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  customer.is_active
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>

                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {customer.contact_number}
                </span>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE DETAILS */}
          <div className="flex-1 flex flex-wrap items-center gap-6 bg-black/30 rounded-xl p-4 border border-[#D4AF37]/10">

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                {customer.aadhaar_number || 'No Aadhaar'}
              </span>
            </div>

            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm text-gray-300">{customer.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                {customer.gender || 'Not specified'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                {customer.date_of_birth
                  ? formatDate(customer.date_of_birth)
                  : 'Not specified'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-gray-300">
                Since {formatDate(customer.created_at)}
              </span>
            </div>

          </div>
        </div>

        {/* ADDRESS */}
        {customer.address && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 border-t border-[#D4AF37]/10 pt-4">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>{customer.address}</span>
          </div>
        )}

        {/* REMOVED: Duplicate Aadhaar Card Section */}

      </div>

      {/* PROJECTS SECTION */}
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-[#D4AF37] rounded-full"></span>
            Projects
          </h2>
        </div>

        <ProjectCardsDeck 
          projects={projects}
          onProjectClick={handleProjectClick}
          onAddClick={() => setIsAddModalOpen(true)}
        />

        {projects.length === 0 && (
          <div className="text-center py-12 bg-black/20 border border-[#D4AF37]/10 rounded-xl">
            <p className="text-gray-400">
              No projects yet. Click "Add New Project" to create your first project.
            </p>
          </div>
        )}
      </div>

      <AddProjectModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customerId={customer.id}
        onProjectAdded={handleProjectAdded}
      />

      {selectedProject && (
        <ProjectZoomView
          isOpen={isZoomViewOpen}
          onClose={() => {
            setIsZoomViewOpen(false)
            setSelectedProject(null)
          }}
          project={selectedProject}
        />
      )}

    </div>
  )
}