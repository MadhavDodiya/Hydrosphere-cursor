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
    companyName: { type: String, required: true, trim: true },
    hydrogenType: {
      type: String,
      enum: HYDROGEN_TYPES,
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
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

export { HYDROGEN_TYPES };
export default mongoose.model("Listing", listingSchema);
