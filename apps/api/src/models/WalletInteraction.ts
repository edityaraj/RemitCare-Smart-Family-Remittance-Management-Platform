import { Schema, model } from "mongoose";

const walletInteractionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    action: { type: String, required: true },
    contractFunction: { type: String },
    txHash: { type: String, required: true, unique: true },
    network: { type: String, enum: ["testnet"], default: "testnet" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const WalletInteraction = model("WalletInteraction", walletInteractionSchema);
