import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String },
    emailId: { type: String },
    message: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
