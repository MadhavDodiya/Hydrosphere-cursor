import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
