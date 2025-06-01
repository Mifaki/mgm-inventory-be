import { z } from "zod";

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

export type PaginationInput = z.infer<typeof paginationSchema>;
