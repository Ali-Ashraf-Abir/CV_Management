import { z } from "zod";

export const positionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title must be 200 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description must be 5000 characters or fewer."),
  deadline: z.string().optional().nullable(),
});

export type PositionFormValues = z.infer<typeof positionFormSchema>;
