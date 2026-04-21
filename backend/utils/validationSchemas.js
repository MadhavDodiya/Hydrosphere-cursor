import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(6).max(200),
  role: z.enum(["buyer", "seller"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(200),
});

export const listingCreateSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  hydrogenType: z.enum(["Green", "Blue", "Grey"]),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0),
  location: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const inquiryCreateSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(5000),
});

export const inquiryReplySchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});
