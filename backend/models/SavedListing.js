import mongoose from "mongoose";

/**
 * Join table: which listings a user bookmarked (buyers primarily).
 * Unique per user + listing.
 */
const savedListingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true, // Performance: needed for cascade deletes
    },
  },
  { timestamps: true }
);

savedListingSchema.index({ user: 1, listing: 1 }, { unique: true });

export default mongoose.model("SavedListing", savedListingSchema);
