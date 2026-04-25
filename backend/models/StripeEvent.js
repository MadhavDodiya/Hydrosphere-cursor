import mongoose from "mongoose";

const stripeEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: String,
    processedAt: {
      type: Date,
      default: Date.now,
      expires: "30d", // Automatically clean up old events after 30 days
    },
  },
  { timestamps: true }
);

export default mongoose.model("StripeEvent", stripeEventSchema);
