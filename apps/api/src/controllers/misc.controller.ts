import type { Request, Response } from "express";
import mongoose from "mongoose";
import { WalletInteraction } from "../models/WalletInteraction.js";
import { Feedback } from "../models/Feedback.js";
import { User } from "../models/User.js";
import { RemittancePlan } from "../models/RemittancePlan.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function listWalletInteractions(req: Request, res: Response) {
  const interactions = await WalletInteraction.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ interactions });
}

export async function getTransaction(req: Request, res: Response) {
  const interaction = await WalletInteraction.findOne({ txHash: req.params.txHash });
  if (!interaction) throw new ApiError(404, "Transaction not found");
  res.json({ interaction });
}

export async function submitFeedback(req: Request, res: Response) {
  const feedback = await Feedback.create({ ...req.body, userId: req.user?.userId });
  res.status(201).json({ feedback });
}

export async function adminStats(_req: Request, res: Response) {
  const [users, plans, feedbackCount, feedbackAvg] = await Promise.all([
    User.countDocuments(),
    RemittancePlan.countDocuments(),
    Feedback.countDocuments(),
    Feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }]),
  ]);
  res.json({
    totalUsers: users,
    totalPlans: plans,
    totalFeedback: feedbackCount,
    averageRating: feedbackAvg[0]?.avgRating ?? null,
  });
}

export async function adminUsers(_req: Request, res: Response) {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users });
}

export async function adminPlans(_req: Request, res: Response) {
  const plans = await RemittancePlan.find().sort({ createdAt: -1 });
  res.json({ plans });
}

export async function adminFeedback(_req: Request, res: Response) {
  const feedback = await Feedback.find().sort({ createdAt: -1 });
  res.json({ feedback });
}

export function healthCheck(_req: Request, res: Response) {
  res.json({ status: "ok" });
}

export function readinessCheck(_req: Request, res: Response) {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not-ready" });
}
