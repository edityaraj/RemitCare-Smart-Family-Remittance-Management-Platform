import type { Request, Response } from "express";
import { Allocation } from "../models/Allocation.js";
import { RemittancePlan } from "../models/RemittancePlan.js";
import { WalletInteraction } from "../models/WalletInteraction.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createAllocation(req: Request, res: Response) {
  const plan = await RemittancePlan.findById(req.params.planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  const already = Number(plan.fundedAmount);
  // Sum of existing, non-cancelled allocations enforced against funded amount.
  const existingAllocations = await Allocation.find({ planId: plan.id, status: { $ne: "cancelled" } });
  const allocated = existingAllocations.reduce((sum, a) => sum + Number(a.amount), 0);
  if (allocated + Number(req.body.amount) > already) {
    throw new ApiError(400, "Allocation exceeds available funded balance");
  }

  const allocation = await Allocation.create({ ...req.body, planId: plan.id, status: "created" });
  res.status(201).json({ allocation });
}

export async function listAllocations(req: Request, res: Response) {
  const allocations = await Allocation.find({ planId: req.params.planId }).sort({ createdAt: -1 });
  res.json({ allocations });
}

export async function requestRelease(req: Request, res: Response) {
  const { requestNote, proofUrl, txHash } = req.body;
  const allocation = await Allocation.findOneAndUpdate(
    { allocationId: req.params.id, status: "created" },
    { status: "requested", requestNote, proofUrl },
    { new: true }
  );
  if (!allocation) throw new ApiError(409, "Allocation is not in a requestable state");

  await WalletInteraction.create({
    userId: req.user!.userId,
    walletAddress: req.user!.userId, // replace with resolved wallet from user profile
    action: "request_release",
    contractFunction: "request_release",
    txHash,
    status: "success",
  });
  res.json({ allocation });
}

export async function approveRelease(req: Request, res: Response) {
  const { txHash } = req.body;
  const allocation = await Allocation.findOneAndUpdate(
    { allocationId: req.params.id, status: "requested" },
    { status: "approved", approvalTxHash: txHash },
    { new: true }
  );
  if (!allocation) throw new ApiError(409, "Allocation is not pending a request");
  res.json({ allocation });
}

export async function claimAllocation(req: Request, res: Response) {
  const { txHash } = req.body;
  const allocation = await Allocation.findOneAndUpdate(
    { allocationId: req.params.id, status: "approved" },
    { status: "claimed", claimTxHash: txHash },
    { new: true }
  );
  if (!allocation) throw new ApiError(409, "Allocation is not approved");

  const plan = await RemittancePlan.findById(allocation.planId);
  if (plan) {
    plan.releasedAmount = String(Number(plan.releasedAmount) + Number(allocation.amount));
    plan.remainingAmount = String(Number(plan.fundedAmount) - Number(plan.releasedAmount));
    await plan.save();
  }
  res.json({ allocation });
}

export async function cancelAllocation(req: Request, res: Response) {
  const allocation = await Allocation.findOneAndUpdate(
    { allocationId: req.params.id, status: { $nin: ["claimed", "cancelled"] } },
    { status: "cancelled" },
    { new: true }
  );
  if (!allocation) throw new ApiError(409, "Allocation cannot be cancelled");
  res.json({ allocation });
}
