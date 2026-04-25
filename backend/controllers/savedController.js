import mongoose from "mongoose";
import SavedListing from "../models/SavedListing.js";
import Listing from "../models/Listing.js";

/**
 * GET /api/saved — current user’s bookmarked listings (full listing docs).
 */
export async function getSavedListings(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = { user: req.userId };

    const [rows, total] = await Promise.all([
      SavedListing.find(filter)
        .populate({
          path: "listing",
          populate: { path: "supplier", select: "name email role" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SavedListing.countDocuments(filter),
    ]);

    const listings = rows.map((r) => r.listing).filter(Boolean);
    return res.json({
      data: listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load saved listings" });
  }
}

/**
 * POST /api/saved — body: { listingId } — bookmark a listing.
 */
export async function saveListing(req, res) {
  try {
    const listingId = req.body?.listingId;
    if (!listingId || !mongoose.isValidObjectId(String(listingId))) {
      return res.status(400).json({ message: "listingId is required and must be valid" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    try {
      await SavedListing.create({
        user: req.userId,
        listing: listingId,
      });
      return res.status(201).json({ message: "Saved to your list" });
    } catch (err) {
      // Duplicate bookmark — treat as success for idempotent UX
      if (err.code === 11000) {
        return res.status(200).json({ message: "Already saved" });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not save listing" });
  }
}

/**
 * DELETE /api/saved/:listingId — remove bookmark.
 */
export async function unsaveListing(req, res) {
  try {
    const { listingId } = req.params;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    await SavedListing.deleteOne({ user: req.userId, listing: listingId });
    return res.json({ message: "Removed from saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not remove saved listing" });
  }
}
