import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["sender", "receiver"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const walletChallengeSchema = z.object({
  walletAddress: z.string().min(56).max(56),
});

export const walletVerifySchema = z.object({
  walletAddress: z.string().min(56).max(56),
  signedChallenge: z.string().min(1),
});
