import mongoose from "mongoose";
import Listing, { HYDROGEN_TYPES } from "../models/Listing.js";
import SavedListing from "../models/SavedListing.js";
import Inquiry from "../models/Inquiry.js";
import User from "../models/User.js";
import { getEffectiveLimits } from "../utils/plans.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";
import { trackEvent, ANALYTICS_EVENTS } from "../services/analyticsService.js";

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
    // 🔍 Upgrade to Text Search for better relevance (Task #11 Audit Fix)
    filter.$text = { $search: q };
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

  if (query.deliveryAvailability) {
    filter.deliveryAvailability = { $regex: escapeRegex(query.deliveryAvailability), $options: "i" };
  }

  if (query.isFeatured === 'true') filter.isFeatured = true;

  return filter;
}

const supplierSelect = "name email role companyName phone isVerified";

/**
 * GET /api/listings — public browsable list
 */
export async function getListings(req, res) {
  try {
    const cacheKey = `listings:${JSON.stringify(req.query)}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ success: true, data: cached, message: "Listings fetched from cache" });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);

    const mineFlag = String(req.query.mine || "").toLowerCase() === "true";
    const requestedSupplier = req.query.supplier ? String(req.query.supplier) : null;

    if (mineFlag && req.userId && req.role === "supplier") {
      filter.supplier = req.userId;
    } else if (requestedSupplier) {
      filter.supplier = requestedSupplier;
      if (!req.userId || String(req.userId) !== requestedSupplier) {
        filter.status = "approved";
      }
    } else {
      filter.status = "approved";
    }

    const sortObj = {};
    const projection = {};

    if (filter.$text) {
      sortObj.score = { $meta: "textScore" };
      projection.score = { $meta: "textScore" };
    }
    
    if (req.query.sort === "Price: Low to High") {
      sortObj.price = 1;
    } else if (req.query.sort === "Price: High to Low") {
      sortObj.price = -1;
    } else {
      sortObj.isFeatured = -1;
      sortObj.createdAt = -1;
    }

    const [listings, total] = await Promise.all([
      Listing.find(filter, projection).populate("supplier", supplierSelect).sort(sortObj).skip(skip).limit(limit).lean(),
      Listing.countDocuments(filter),
    ]);

    const result = {
      data: listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    setCache(`listings:${JSON.stringify(req.query)}`, result, 60);
    return res.json({ 
      success: true, 
      data: result, 
      message: "Listings fetched successfully" 
    });
  } catch (err) {
    console.error("[GET LISTINGS Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
}

/**
 * GET /api/listings/my-listings — supplier's own listings
 */
export async function getMyListings(req, res) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find({ supplier: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Listing.countDocuments({ supplier: req.userId }),
    ]);

    return res.json({
      success: true,
      message: "Your listings fetched successfully",
      data: {
        data: listings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch your listings" });
  }
}

/**
 * GET /api/listings/:id
 */
export async function getListingById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const listing = await Listing.findById(id).populate("supplier", supplierSelect).lean();
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    const isOwner = req.userId && String(listing.supplier?._id || listing.supplier) === String(req.userId);
    const isAdmin = req.role === "admin";
    if (listing.status !== "approved" && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    let saved = false;
    if (req.userId) {
      const exists = await SavedListing.exists({ user: req.userId, listing: id });
      saved = Boolean(exists);
    }

    return res.json({
      success: true,
      message: "Listing fetched successfully",
      data: {
        ...listing,
        saved,
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch listing" });
  }
}

/**
 * POST /api/listings
 */
export async function createListing(req, res) {
  try {
    const { title, hydrogenType, price, quantity, location, description } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    if (!title || !hydrogenType || price == null || quantity == null || !location || !description) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // Security: Admin Approval Check
    if (req.role === "supplier" && !req.isApproved) {
      return res.status(403).json({ success: false, message: "Your supplier account is pending admin approval." });
    }

    // SaaS: subscription required to post listings
    if (req.role === "supplier" && req.subscriptionStatus !== "active") {
      return res.status(403).json({ success: false, message: "An active subscription is required to post listings." });
    }

    // SaaS: listing limit enforcement
    const { plan, listingsLimit } = getEffectiveLimits({
      planId: req.plan,
      listingLimitOverride: req.listingLimit,
      leadLimitOverride: req.leadLimit,
    });

    if (listingsLimit != null) {
      const existingCount = await Listing.countDocuments({ supplier: req.userId });
      if (existingCount >= listingsLimit) {
        return res.status(402).json({
          success: false,
          message: `Listing limit reached for ${plan.name} plan. Please upgrade for more.`,
        });
      }
    }

    const listing = await Listing.create({
      supplier: req.userId,
      title,
      hydrogenType,
      price: Number(price),
      quantity: Number(quantity),
      location,
      description,
      images,
    });

    clearCache(); // Invalidate marketplace search cache
    
    // Track Event
    trackEvent(req.userId, ANALYTICS_EVENTS.LISTING_CREATED, { listingId: listing._id, hydrogenType });
    return res.status(201).json({ 
      success: true, 
      data: listing, 
      message: "Listing created successfully" 
    });
  } catch (err) {
    console.error("[CREATE LISTING Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to create listing" });
  }
}

/**
 * PUT /api/listings/:id
 */
export async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.supplier.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { title, hydrogenType, price, quantity, location, description } = req.body;
    const newImages = req.files ? req.files.map((file) => file.path) : [];

    if (newImages.length > 0) listing.images = [...listing.images, ...newImages];
    if (title) {
      listing.title = title;
    }
    if (hydrogenType) listing.hydrogenType = hydrogenType;
    if (price != null) listing.price = Number(price);
    if (quantity != null) listing.quantity = Number(quantity);
    if (location) listing.location = location;
    if (description) listing.description = description;

    await listing.save();
    clearCache(); // Invalidate marketplace search cache
    return res.json({ 
      success: true, 
      data: listing, 
      message: "Listing updated successfully" 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update listing" });
  }
}

/**
 * DELETE /api/listings/:id
 */
export async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.supplier.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Promise.all([
      Listing.deleteOne({ _id: id }),
      SavedListing.deleteMany({ listing: id }),
      Inquiry.deleteMany({ listingId: id }),
    ]);
    clearCache(); // Invalidate marketplace search cache
    return res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete listing" });
  }
}
