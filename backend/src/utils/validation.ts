import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['admin', 'hr', 'candidate']).optional(),
  company: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createJobSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(20),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  experienceRequired: z.number().min(0).max(50).optional(),
  company: z.string().min(1).max(150),
});

export const applyToJobSchema = z.object({
  candidateId: z.string().min(1),
  jobId: z.string().min(1),
});
