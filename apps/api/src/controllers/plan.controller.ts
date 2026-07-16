import type { Request, Response } from "express";
import { RemittancePlan } from "../models/RemittancePlan.js";
import { WalletInteraction } from "../models/WalletInteraction.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createPlan(req: Request, res: Response) {
  const body = req.body;
  const plan = await RemittancePlan.create({
    planId: body.contractPlanId,
    senderId: req.user!.userId,
    senderWallet: body.senderWallet,
    receiverWallet: body.receiverWallet,
    title: body.title,
    description: body.description,
    totalAmount: body.totalAmount,
    tokenContractId: body.tokenContractId,
    contractPlanId: body.contractPlanId,
    status: "draft",
  });
  res.status(201).json({ plan });
}

export async function listPlans(req: Request, res: Response) {
  const filter =
    req.user!.role === "sender" ? { senderId: req.user!.userId } : { receiverId: req.user!.userId };
  const plans = await RemittancePlan.find(filter).sort({ createdAt: -1 });
  res.json({ plans });
}

export async function getPlan(req: Request, res: Response) {
  const plan = await RemittancePlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, "Plan not found");
  res.json({ plan });
}

// Records a funding event *after* the on-chain fund_plan() call already
// succeeded and was confirmed — never flips status before confirmation.
export async function recordFunding(req: Request, res: Response) {
  const { amount, txHash } = req.body;
  const plan = await RemittancePlan.findById(req.params.id);
  if (!plan) throw new ApiError(404, "Plan not found");

  const existing = await WalletInteraction.findOne({ txHash });
  if (existing) throw new ApiError(409, "Transaction already recorded");

  plan.fundedAmount = String(Number(plan.fundedAmount) + Number(amount));
  plan.remainingAmount = String(Number(plan.totalAmount) - Number(plan.fundedAmount));
  plan.status = "active";
  plan.fundingTxHash = txHash;
  await plan.save();

  await WalletInteraction.create({
    userId: req.user!.userId,
    walletAddress: plan.senderWallet,
    action: "fund_plan",
    contractFunction: "fund_plan",
    txHash,
    status: "success",
  });

  res.json({ plan });
}

export async function updatePlanStatus(req: Request, res: Response) {
  const plan = await RemittancePlan.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!plan) throw new ApiError(404, "Plan not found");
  res.json({ plan });
}
