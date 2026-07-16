import { z } from "zod";

export const createAllocationSchema = z.object({
  allocationId: z.string().min(1),
  purpose: z.enum(["education", "healthcare", "food", "rent", "allowance", "other"]),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  releaseType: z.enum(["manual", "scheduled", "receiver_request"]).default("receiver_request"),
  releaseDate: z.string().datetime().optional(),
});

export const requestReleaseSchema = z.object({
  requestNote: z.string().max(500).optional(),
  proofUrl: z.string().url().optional(),
  txHash: z.string().min(1),
});

export const txRecordSchema = z.object({
  txHash: z.string().min(1),
});
