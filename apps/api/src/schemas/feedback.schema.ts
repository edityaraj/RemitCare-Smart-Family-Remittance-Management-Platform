import { z } from "zod";

export const feedbackSchema = z.object({
  role: z.enum(["sender", "receiver"]),
  rating: z.number().int().min(1).max(5),
  usabilityRating: z.number().int().min(1).max(5),
  trustRating: z.number().int().min(1).max(5),
  message: z.string().min(1).max(1000),
  suggestion: z.string().max(1000).optional(),
});
