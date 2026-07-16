import { z } from "zod";

export const createReceiverSchema = z.object({
  receiverWallet: z.string().min(56).max(56),
  nickname: z.string().min(1).max(60),
  relationship: z.string().max(60).optional(),
});

export const updateReceiverSchema = createReceiverSchema.partial();
