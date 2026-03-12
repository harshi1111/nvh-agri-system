import { z } from 'zod'

export const customerSchema = z.object({
  aadhaar_number: z.string().length(12, 'Aadhaar must be 12 digits').regex(/^\d+$/, 'Only numbers allowed'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['Male', 'Female', 'Other']),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  contact_number: z.string().length(10, 'Phone must be 10 digits').regex(/^\d+$/, 'Only numbers allowed'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type CustomerFormValues = z.infer<typeof customerSchema>