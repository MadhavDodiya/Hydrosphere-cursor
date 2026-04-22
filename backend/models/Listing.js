import mongoose from "mongoose";

const HYDROGEN_TYPES = ["Green", "Blue", "Grey"];

/**
 * Hydrogen listing — owned by a seller.
 * createdAt / updatedAt come from { timestamps: true }.
 */
const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Canonical listing title (UI-facing). Kept optional for legacy documents.
    title: { type: String, trim: true, default: "", maxlength: 200, index: true },
    // Legacy field used across the MVP UI and admin search. New code should treat it as an alias of `title`.
    companyName: { type: String, required: true, trim: true },
    hydrogenType: {
      type: String,
      enum: HYDROGEN_TYPES,
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
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
  { timestamps: true }
);

listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ seller: 1, createdAt: -1 });
listingSchema.index({ location: 1 });
listingSchema.index({ hydrogenType: 1 }); // Required for hydrogen type filtering

export { HYDROGEN_TYPES };
export default mongoose.model("Listing", listingSchema);
