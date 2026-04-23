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
      index: true, // Performance: needed for admin user search
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
      index: true, // Performance: needed for search
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
    // Email verification (separate from supplier verification).
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      default: "",
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    // Industry Specific: Seller Verification
    businessRegistrationNumber: {
      type: String,
      trim: true,
      default: "",
    },
    certifications: {
      type: [String],
      default: [],
    },
    // Admin Approval for Suppliers
    isApproved: {
      type: Boolean,
      default: false,
      index: true, // Indexed for fast admin approval queue queries
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
    razorpayCustomerId: {
      type: String,
      default: "",
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      default: "",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: null,
    },

    // Optional per-account overrides (used by plan enforcement if set).
    // If null/undefined, limits come from plan defaults in utils/plans.js.
    listingLimit: {
      type: Number,
      default: null,
      min: 0,
    },
    leadLimit: {
      type: Number,
      default: null,
      min: 0,
    },

    passwordResetToken: {
      type: String,
      default: "",
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
