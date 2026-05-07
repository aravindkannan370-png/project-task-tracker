import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  memberIds: z.array(z.string().min(1)).default([])
});

export const taskSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.number().int().min(1).max(3).default(2)
});

export const statusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"])
});
