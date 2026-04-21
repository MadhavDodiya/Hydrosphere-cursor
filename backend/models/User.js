import mongoose from "mongoose";

/**
 * Application user — buyer or seller (bookmarks live in SavedListing model).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },

    // SaaS subscription (seller-focused; buyers can remain "free")
    plan: {
      type: String,
      enum: ["free", "pro_supplier", "enterprise"],
      default: "free",
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "past_due", "canceled"],
      default: "inactive",
      index: true,
    },
    stripeCustomerId: {
      type: String,
      default: "",
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: "",
      index: true,
    },
    stripePriceId: {
      type: String,
      default: "",
    },
    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
