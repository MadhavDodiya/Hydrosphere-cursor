import mongoose from "mongoose";
import Listing, { HYDROGEN_TYPES } from "../models/Listing.js";
import SavedListing from "../models/SavedListing.js";

/** Escape user input for safe use inside a Mongo regex. */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build MongoDB filter from query string (location, type, price range, seller, search q).
 */
function buildFilter(query) {
  const filter = {};

  const q = query.q != null ? String(query.q).trim() : "";
  if (q) {
    const safe = escapeRegex(q);
    filter.$or = [
      { companyName: { $regex: safe, $options: "i" } },
      { location: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ];
  }

  if (query.location && String(query.location).trim()) {
    const loc = escapeRegex(String(query.location).trim());
    const locationCond = { $regex: loc, $options: "i" };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { location: locationCond }];
      delete filter.$or;
    } else {
      filter.location = locationCond;
    }
  }

  if (query.hydrogenType && HYDROGEN_TYPES.includes(query.hydrogenType)) {
    filter.hydrogenType = query.hydrogenType;
  }

  const minPrice = query.minPrice != null ? Number(query.minPrice) : NaN;
  const maxPrice = query.maxPrice != null ? Number(query.maxPrice) : NaN;

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filter.price = {};
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (query.seller && String(query.seller).trim()) {
    filter.seller = String(query.seller).trim();
  } else {
    // Marketplace view only shows approved listings
    filter.status = "approved";
  }

  return filter;
}

const sellerSelect = "name email role companyName phone isVerified";

/** Map Mongoose validation errors to a 400 response. */
function validationMessage(err) {
  if (err.name !== "ValidationError" || !err.errors) return null;
  const first = Object.values(err.errors)[0];
  return first?.message || "Validation failed";
}

/**
 * GET /api/listings/:id — single listing; includes `saved` when Bearer token is valid.
 */
export async function getListingById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const listing = await Listing.findById(id).populate("seller", sellerSelect).lean();
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    let saved = false;
    if (req.userId) {
      const exists = await SavedListing.exists({ user: req.userId, listing: id });
      saved = Boolean(exists);
    }

    return res.json({ ...listing, saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch listing" });
  }
}

/**
 * GET /api/listings — paginated list with optional filters (public).
 *
 * Query params:
 *   page      (default 1)
 *   limit     (default 12, max 100)
 *   q, location, hydrogenType, minPrice, maxPrice, seller
 *
 * Response: { data: [...], total, page, totalPages }
 */
export async function getListings(req, res) {
  try {
    const sellerQ = req.query.seller != null ? String(req.query.seller).trim() : "";
    if (sellerQ && !mongoose.isValidObjectId(sellerQ)) {
      return res.status(400).json({ message: "Invalid seller id in query" });
    }

    // --- Pagination params ---
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);

    // Run query + count in parallel for efficiency
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", sellerSelect)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return res.json({
      data: listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch listings" });
  }
}

/**
 * POST /api/listings — create (seller only, JWT).
 */
export async function createListing(req, res) {
  try {
    const { companyName, hydrogenType, price, quantity, location, description } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    if (
      !companyName ||
      !hydrogenType ||
      price == null ||
      quantity == null ||
      !location ||
      description == null ||
      String(description).trim() === ""
    ) {
      return res.status(400).json({
        message:
          "companyName, hydrogenType, price, quantity, location, and description are required",
      });
    }

    if (!HYDROGEN_TYPES.includes(hydrogenType)) {
      return res.status(400).json({
        message: `hydrogenType must be one of: ${HYDROGEN_TYPES.join(", ")}`,
      });
    }

    const p = Number(price);
    const q = Number(quantity);
    if (Number.isNaN(p) || p < 0 || Number.isNaN(q) || q < 0) {
      return res.status(400).json({ message: "price and quantity must be valid non-negative numbers" });
    }

    const desc = String(description).trim();
    if (desc.length < 10) {
      return res.status(400).json({ message: "description must be at least 10 characters" });
    }

    const listing = await Listing.create({
      seller: req.userId,
      companyName: String(companyName).trim(),
      hydrogenType,
      price: p,
      quantity: q,
      location: String(location).trim(),
      description: desc,
      images,
    });

    const populated = await Listing.findById(listing._id).populate("seller", sellerSelect);

    return res.status(201).json(populated);
  } catch (err) {
    const v = validationMessage(err);
    if (v) return res.status(400).json({ message: v });
    console.error(err);
    return res.status(500).json({ message: "Failed to create listing" });
  }
}

/**
 * PUT /api/listings/:id — update own listing (seller only).
 */
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own listings" });
    }

    const { companyName, hydrogenType, price, quantity, location, description } = req.body;
    const newImages = req.files ? req.files.map((file) => file.path) : [];

    if (newImages.length > 0) {
      listing.images = [...listing.images, ...newImages];
    }

    if (companyName != null) listing.companyName = String(companyName).trim();
    if (hydrogenType != null) {
      if (!HYDROGEN_TYPES.includes(hydrogenType)) {
        return res.status(400).json({
          message: `hydrogenType must be one of: ${HYDROGEN_TYPES.join(", ")}`,
        });
      }
      listing.hydrogenType = hydrogenType;
    }
    if (price != null) {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) {
        return res.status(400).json({ message: "price must be a valid non-negative number" });
      }
      listing.price = p;
    }
    if (quantity != null) {
      const q = Number(quantity);
      if (Number.isNaN(q) || q < 0) {
        return res.status(400).json({ message: "quantity must be a valid non-negative number" });
      }
      listing.quantity = q;
    }
    if (location != null) listing.location = String(location).trim();
    if (description != null) {
      const d = String(description).trim();
      if (d.length < 10) {
        return res.status(400).json({ message: "description must be at least 10 characters" });
      }
      listing.description = d;
    }

    await listing.save();
    const populated = await Listing.findById(listing._id).populate("seller", sellerSelect);

    return res.json(populated);
  } catch (err) {
    const v = validationMessage(err);
    if (v) return res.status(400).json({ message: v });
    console.error(err);
    return res.status(500).json({ message: "Failed to update listing" });
  }
}

/**
 * DELETE /api/listings/:id — delete own listing (seller only).
 */
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own listings" });
    }

    await SavedListing.deleteMany({ listing: listing._id });
    await Listing.deleteOne({ _id: listing._id });
    return res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete listing" });
  }
}
