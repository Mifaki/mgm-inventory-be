import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
});

export const updateItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  quantity: z
    .number()
    .int()
    .min(0, "Quantity must be a non-negative integer")
    .optional(),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
