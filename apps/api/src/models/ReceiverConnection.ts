import { Schema, model, Types } from "mongoose";

const receiverConnectionSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User" },
    receiverWallet: { type: String, required: true },
    nickname: { type: String, required: true },
    relationship: { type: String },
    status: { type: String, enum: ["pending", "active", "blocked"], default: "pending" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

receiverConnectionSchema.index({ senderId: 1, receiverWallet: 1 }, { unique: true });

export const ReceiverConnection = model("ReceiverConnection", receiverConnectionSchema);
