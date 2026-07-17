import { Schema, model } from "mongoose";

const allocationSchema = new Schema(
  {
    allocationId: { type: String, required: true, unique: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "RemittancePlan", required: true, index: true },
    purpose: {
      type: String,
      enum: ["education", "healthcare", "food", "rent", "allowance", "other"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: String, required: true },
    releaseType: { type: String, enum: ["manual", "scheduled", "receiver_request"], default: "receiver_request" },
    releaseDate: { type: Date },
    status: {
      type: String,
      enum: ["created", "funded", "requested", "approved", "claimed", "cancelled"],
      default: "created",
    },
    requestNote: { type: String },
    proofUrl: { type: String },
    approvalTxHash: { type: String },
    claimTxHash: { type: String },
    creationTxHash: { type: String },
    requestTxHash: { type: String },
    cancelTxHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Allocation = model("Allocation", allocationSchema);
