import { z } from "zod";

export const createPlanSchema = z.object({
  receiverWallet: z.string().min(56).max(56),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  totalAmount: z.string().regex(/^\d+(\.\d+)?$/),
  tokenContractId: z.string().min(1),
  contractPlanId: z.string().min(1),
  senderWallet: z.string().min(56).max(56),
});

export const fundingRecordSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  txHash: z.string().min(1),
});

export const planStatusSchema = z.object({
  status: z.enum(["draft", "active", "completed", "cancelled"]),
});
