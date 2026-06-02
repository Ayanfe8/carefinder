import { z } from 'zod';

export const HospitalInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  lga: z.string().min(2, 'LGA must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, 'Phone must be in +234XXXXXXXXXX format'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  ownership: z.enum(['public', 'private'] as const).refine(Boolean, {
    message: 'Ownership must be public or private',
  }),
  latitude: z
    .number()
    .min(4, 'Latitude must be within Nigeria (4°N – 14°N)')
    .max(14, 'Latitude must be within Nigeria (4°N – 14°N)'),
  longitude: z
    .number()
    .min(2, 'Longitude must be within Nigeria (2°E – 15°E)')
    .max(15, 'Longitude must be within Nigeria (2°E – 15°E)'),
  description_md: z.string().optional(),
  visiting_hours: z.string().optional(),
});

export type HospitalInput = z.infer<typeof HospitalInputSchema>;

export const ReviewSchema = z.object({
  hospital_id: z.string().uuid('Invalid hospital ID'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  text: z.string().optional(),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

export const ShareRequestSchema = z.object({
  to: z.string().email('Invalid recipient email address'),
  hospitalIds: z
    .array(z.string().uuid())
    .min(1, 'Select at least one hospital')
    .max(20, 'Maximum 20 hospitals per email'),
  senderName: z.string().optional(),
});

export type ShareRequest = z.infer<typeof ShareRequestSchema>;

export const RevalidateRequestSchema = z.object({
  secret: z.string().min(1),
  hospitalId: z.string().uuid(),
});
