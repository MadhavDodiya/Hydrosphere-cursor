import mongoose from "mongoose";
import Listing, { HYDROGEN_TYPES } from "../models/Listing.js";
import SavedListing from "../models/SavedListing.js";
import { getEffectiveLimits } from "../utils/plans.js";

/** Escape user input for safe use inside a Mongo regex. */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build MongoDB filter from query string.
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

  if (query.hydrogenType) {
    const types = String(query.hydrogenType)
      .split(',')
      .map(t => t.trim())
      .filter(t => HYDROGEN_TYPES.includes(t));
    
    if (types.length > 0) filter.hydrogenType = { $in: types };
  }

  const minPrice = query.minPrice != null ? Number(query.minPrice) : NaN;
  const maxPrice = query.maxPrice != null ? Number(query.maxPrice) : NaN;

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filter.price = {};
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }

  if (query.isFeatured === 'true') filter.isFeatured = true;

  const minPurity = query.minPurity != null ? Number(query.minPurity) : NaN;
  const maxPurity = query.maxPurity != null ? Number(query.maxPurity) : NaN;
  if (!Number.isNaN(minPurity) || !Number.isNaN(maxPurity)) {
    filter.purity = {};
    if (!Number.isNaN(minPurity)) filter.purity.$gte = minPurity;
    if (!Number.isNaN(maxPurity)) filter.purity.$lte = maxPurity;
  }

  return filter;
}

const sellerSelect = "name email role companyName phone isVerified";

/**
 * GET /api/listings — public browsable list
 */
export async function getListings(req, res) {
  try {
    console.log("[GET LISTINGS] Query:", req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (req.query.sort === "Price: Low to High") sortObj = { price: 1 };
    else if (req.query.sort === "Price: High to Low") sortObj = { price: -1 };

    const filter = buildFilter(req.query);

    // Filter logic:
    // - Public browsing (no auth): only approved listings
    // - Authenticated users: still only approved, unless seller is explicitly asking for their own listings
    const mineFlag = String(req.query.mine || "").toLowerCase() === "true";
    const requestedSeller = req.query.seller ? String(req.query.seller) : null;

    if (mineFlag && req.userId && req.role === "seller") {
      filter.seller = req.userId;
      // Seller can see all their own listings (pending/approved/rejected)
    } else if (requestedSeller) {
      // If a seller id is provided, enforce approved unless the requester is that seller
      filter.seller = requestedSeller;
      if (!req.userId || String(req.userId) !== requestedSeller) {
        filter.status = "approved";
      }
    } else {
      filter.status = "approved";
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter).populate("seller", sellerSelect).sort(sortObj).skip(skip).limit(limit).lean(),
      Listing.countDocuments(filter),
    ]);

    return res.json({
      data: listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET LISTINGS Error]:", err);
    return res.status(500).json({ message: "Failed to fetch listings" });
  }
}

/**
 * GET /api/listings/my-listings — seller's own listings
 */
export async function getMyListings(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("[MY LISTINGS] User ID:", req.userId);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find({ seller: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Listing.countDocuments({ seller: req.userId }),
    ]);

    console.log(`[MY LISTINGS] Found ${listings.length} items (page=${page}, limit=${limit})`);

    return res.json({
      data: listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[MY LISTINGS Error]:", err);
    return res.status(500).json({ message: "Failed to fetch your listings" });
  }
}

/**
 * GET /api/listings/:id
 */
export async function getListingById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const listing = await Listing.findById(id).populate("seller", sellerSelect).lean();
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Public access: only approved listings.
    // Owners (seller) and admins can view pending/rejected for edit/ops workflows.
    const isOwner = req.userId && String(listing.seller?._id || listing.seller) === String(req.userId);
    const isAdmin = req.role === "admin";
    if (listing.status !== "approved" && !isOwner && !isAdmin) {
      return res.status(404).json({ message: "Listing not found" });
    }

    let saved = false;
    if (req.userId) {
      const exists = await SavedListing.exists({ user: req.userId, listing: id });
      saved = Boolean(exists);
    }

    return res.json({ ...listing, saved });
  } catch (err) {
    console.error("[GET BY ID Error]:", err);
    return res.status(500).json({ message: "Failed to fetch listing" });
  }
}

/**
 * POST /api/listings
 */
export async function createListing(req, res) {
  try {
    const { companyName, hydrogenType, price, quantity, location, description, purity } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    if (!companyName || !hydrogenType || price == null || quantity == null || !location || !description) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // SaaS: listing limit enforcement (seller plans)
    const { plan, listingsLimit } = getEffectiveLimits({
      planId: req.plan,
      listingLimitOverride: req.listingLimit,
      leadLimitOverride: req.leadLimit,
    });

    if (listingsLimit != null) {
      const existingCount = await Listing.countDocuments({ seller: req.userId });
      if (existingCount >= listingsLimit) {
        return res.status(402).json({
          message: `Listing limit reached for plan: ${plan.name}`,
        });
      }
    }

    const listing = await Listing.create({
      seller: req.userId,
      companyName: String(companyName).trim(),
      hydrogenType,
      price: Number(price),
      quantity: Number(quantity),
      location: String(location).trim(),
      description: String(description).trim(),
      purity: purity != null && purity !== "" ? Number(purity) : null,
      images,
    });

    return res.status(201).json(listing);
  } catch (err) {
    console.error("[CREATE LISTING Error]:", err);
    return res.status(500).json({ message: "Failed to create listing" });
  }
}

/**
 * PUT /api/listings/:id
 */
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { companyName, hydrogenType, price, quantity, location, description, purity } = req.body;
    const newImages = req.files ? req.files.map((file) => file.path) : [];

    if (newImages.length > 0) listing.images = [...listing.images, ...newImages];
    if (companyName) listing.companyName = companyName;
    if (hydrogenType) listing.hydrogenType = hydrogenType;
    if (price != null) listing.price = Number(price);
    if (quantity != null) listing.quantity = Number(quantity);
    if (location) listing.location = location;
    if (description) listing.description = description;
    if (purity != null) listing.purity = purity === "" ? null : Number(purity);

    await listing.save();
    return res.json(listing);
  } catch (err) {
    console.error("[UPDATE LISTING Error]:", err);
    return res.status(500).json({ message: "Failed to update listing" });
  }
}

/**
 * DELETE /api/listings/:id
 */
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Listing.deleteOne({ _id: id });
    await SavedListing.deleteMany({ listing: id });
    return res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("[DELETE LISTING Error]:", err);
    return res.status(500).json({ message: "Failed to delete listing" });
  }
}
