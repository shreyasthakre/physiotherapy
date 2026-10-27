import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('A valid email is required');
const password = z.string().min(8, 'Password must be at least 8 characters');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email,
  password,
  phone: z.string().trim().min(6).max(20).optional().or(z.literal('')).transform((v) => v || undefined),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

/** Admin registers a walk-in / phone patient — email is optional. */
export const adminCreatePatientSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().min(6, 'A valid mobile number is required').max(20),
  email: email.optional().or(z.literal('')).transform((v) => v || undefined),
});

export const slugParam = z.object({ slug: z.string().trim().min(1) });
export const idParam = z.object({ id: z.string().uuid('Invalid id') });

export const serviceSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().nonnegative().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).transform((v) => v || undefined),
  isActive: z.boolean().optional(),
});

export const serviceUpdateSchema = serviceSchema.partial().omit({ slug: true });

export const appointmentSchema = z.object({
  patientId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  physiotherapistId: z.string().uuid().optional(),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive().max(240).optional(),
  reason: z.string().trim().max(1000).optional(),
});

export const appointmentUpdateSchema = z.object({
  serviceId: z.string().uuid().optional(),
  physiotherapistId: z.string().uuid().optional(),
  scheduledAt: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().max(240).optional(),
  status: z.enum(['booked', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show']).optional(),
  reason: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(4000).optional(),
});

export const notifySchema = z.object({
  channel: z.enum(['whatsapp', 'sms', 'email', 'call']).optional(),
  message: z.string().trim().min(1).max(1000).optional(),
});

export const recordSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(['prescription', 'exercise_plan', 'progress_report']),
  title: z.string().trim().min(1),
  body: z.string().trim().optional(),
  data: z.record(z.any()).optional(),
});

export const blogSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().min(1),
  coverImageUrl: z.string().url().optional().or(z.literal('')).transform((v) => v || undefined),
  videoUrl: z.string().url().optional().or(z.literal('')).transform((v) => v || undefined),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const blogUpdateSchema = blogSchema.partial().omit({ slug: true });

export const testimonialSchema = z.object({
  patientName: z.string().trim().min(1),
  avatarUrl: z.string().url().optional().or(z.literal('')).transform((v) => v || undefined),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  quote: z.string().trim().min(1),
  location: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1),
  email,
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(4000),
});

export const newsletterSchema = z.object({
  email,
  firstName: z.string().trim().max(100).optional(),
});

export const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'physiotherapist', 'patient']),
});
