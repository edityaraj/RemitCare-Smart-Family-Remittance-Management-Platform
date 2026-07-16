import { Schema, model } from "mongoose";

const remittancePlanSchema = new Schema(
  {
    planId: { type: String, required: true, unique: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    senderWallet: { type: String, required: true },
    receiverWallet: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    totalAmount: { type: String, required: true },
    fundedAmount: { type: String, default: "0" },
    releasedAmount: { type: String, default: "0" },
    remainingAmount: { type: String, default: "0" },
    tokenContractId: { type: String, required: true },
    contractPlanId: { type: String, required: true },
    status: { type: String, enum: ["draft", "active", "completed", "cancelled"], default: "draft" },
    fundingTxHash: { type: String },
  },
  { timestamps: true }
);

export const RemittancePlan = model("RemittancePlan", remittancePlanSchema);
