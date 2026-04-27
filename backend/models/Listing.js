import mongoose from "mongoose";

const HYDROGEN_TYPES = ["Green Hydrogen", "Blue Hydrogen", "Grey Hydrogen"];

/**
 * Hydrogen listing — owned by a supplier.
 * createdAt / updatedAt come from { timestamps: true }.
 */
const listingSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Canonical listing title (UI-facing). Kept optional for legacy documents.
    title: { type: String, trim: true, default: "", maxlength: 200, index: true },
    // Legacy field used across the MVP UI and admin search. New code should treat it as an alias of `title`.
    companyName: { type: String, required: true, trim: true, index: true },
    hydrogenType: {
      type: String,
      enum: HYDROGEN_TYPES,
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    // Industry Specific Features
    productionCapacity: {
      type: String,
      trim: true,
      default: "", // e.g., "500 kg/day"
    },
    deliveryAvailability: {
      type: String,
      trim: true,
      default: "", // e.g., "Available", "30 Days Lead Time"
    },
    // Hydrogen purity percentage (e.g. 99.9). Optional for legacy docs.
    purity: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    // Required on create via controller; optional in schema so older DB docs still load
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Canonical display name (Bug fix: resolves title vs companyName inconsistency)
listingSchema.virtual("displayName").get(function () {
  return this.title || this.companyName;
});

listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ supplier: 1, createdAt: -1 });
listingSchema.index({ location: 1 });
listingSchema.index({ hydrogenType: 1 }); // Required for hydrogen type filtering

// 🔍 FULL-TEXT SEARCH INDEX (Task #11 Audit Fix)
listingSchema.index(
  { title: "text", companyName: "text", description: "text" },
  { weights: { title: 10, companyName: 10, description: 2 }, name: "ListingTextSearch" }
);

export { HYDROGEN_TYPES };
export default mongoose.model("Listing", listingSchema);
