import { Schema, model } from "mongoose";

const feedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    usabilityRating: { type: Number, min: 1, max: 5, required: true },
    trustRating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
    suggestion: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = model("Feedback", feedbackSchema);
