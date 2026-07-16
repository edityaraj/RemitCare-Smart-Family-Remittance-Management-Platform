import type { Request, Response } from "express";
import { ReceiverConnection } from "../models/ReceiverConnection.js";
import { ApiError } from "../middleware/errorHandler.js";

export async function createReceiver(req: Request, res: Response) {
  const { receiverWallet, nickname, relationship } = req.body;
  const receiver = await ReceiverConnection.create({
    senderId: req.user!.userId,
    receiverWallet,
    nickname,
    relationship,
    status: "pending",
  });
  res.status(201).json({ receiver });
}

export async function listReceivers(req: Request, res: Response) {
  const receivers = await ReceiverConnection.find({ senderId: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ receivers });
}

export async function updateReceiver(req: Request, res: Response) {
  const receiver = await ReceiverConnection.findOneAndUpdate(
    { _id: req.params.id, senderId: req.user!.userId },
    req.body,
    { new: true }
  );
  if (!receiver) throw new ApiError(404, "Receiver not found");
  res.json({ receiver });
}

export async function deleteReceiver(req: Request, res: Response) {
  const receiver = await ReceiverConnection.findOne({ _id: req.params.id, senderId: req.user!.userId });
  if (!receiver) throw new ApiError(404, "Receiver not found");
  if (receiver.status === "active") {
    throw new ApiError(409, "Cannot remove a receiver with an active plan");
  }
  await receiver.deleteOne();
  res.status(204).send();
}
