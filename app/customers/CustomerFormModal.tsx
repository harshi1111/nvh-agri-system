'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, CustomerFormValues } from '@/lib/validations/customer'
import { createCustomer } from '@/lib/actions/customers'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CustomerFormModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      gender: 'Male',
      is_active: true,
    }
  })

  const gender = watch('gender')
  const isActive = watch('is_active')

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const result = await createCustomer(formData)

    if (result.error) {
      setServerError(result.error)
      setIsSubmitting(false)
    } else {
      reset()
      onClose()
      router.refresh()
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1A1F1A] border border-[#D4AF37]/30 rounded-2xl shadow-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#F5F5F0]">Add New Customer</DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the customer details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          {serverError && (
            <div className="p-3 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30">
              {serverError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="aadhaar_number" className="text-gray-300 text-sm">Aadhaar Number *</Label>
            <Input
              id="aadhaar_number"
              {...register('aadhaar_number')}
              placeholder="12 digits"
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            {errors.aadhaar_number && (
              <p className="text-xs text-red-400">{errors.aadhaar_number.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="full_name" className="text-gray-300 text-sm">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            {errors.full_name && (
              <p className="text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="gender" className="text-gray-300 text-sm">Gender</Label>
            <Select value={gender} onValueChange={(val) => setValue('gender', val as 'Male' | 'Female' | 'Other')}>
              <SelectTrigger className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F1A] border border-[#D4AF37]/30 text-white">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="date_of_birth" className="text-gray-300 text-sm">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register('date_of_birth')}
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="address" className="text-gray-300 text-sm">Address</Label>
            <Input
              id="address"
              {...register('address')}
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contact_number" className="text-gray-300 text-sm">Contact Number *</Label>
            <Input
              id="contact_number"
              {...register('contact_number')}
              placeholder="10 digits"
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            {errors.contact_number && (
              <p className="text-xs text-red-400">{errors.contact_number.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-transparent border border-[#D4AF37]/30 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked === true)}
              className="border-[#D4AF37] text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <Label htmlFor="is_active" className="text-gray-300 text-sm">Active (can do transactions)</Label>
          </div>

          <DialogFooter className="mt-6 flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full px-6 py-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-[#0A0F0A] rounded-full px-6 py-2 font-semibold hover:bg-[#c4a030] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}