import { HYDROGEN_TYPES } from "../models/Listing.js";

/** Escape user input for safe use inside a Mongo regex. */
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function applyTextSearchFilter(filter, query) {
  const q = query.q != null ? String(query.q).trim() : "";
  if (q) {
    // 🔍 Upgrade to Text Search for better relevance (Task #11 Audit Fix)
    filter.$text = { $search: q };
  }
}

export function applyLocationFilter(filter, query) {
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
}

export function applyHydrogenTypeFilter(filter, query) {
  if (query.hydrogenType) {
    const types = String(query.hydrogenType)
      .split(',')
      .map(t => t.trim())
      .filter(t => HYDROGEN_TYPES.includes(t));

    if (types.length > 0) filter.hydrogenType = { $in: types };
  }
}

export function applyPriceFilter(filter, query) {
  const minPrice = query.minPrice != null ? Number(query.minPrice) : NaN;
  const maxPrice = query.maxPrice != null ? Number(query.maxPrice) : NaN;

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    filter.price = {};
    if (!Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (!Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;
  }
}

export function applyDeliveryFilter(filter, query) {
  if (query.deliveryAvailability) {
    filter.deliveryAvailability = { $regex: escapeRegex(query.deliveryAvailability), $options: "i" };
  }
}

export function applyFeaturedFilter(filter, query) {
  if (query.isFeatured === 'true') filter.isFeatured = true;
}

/**
 * Build MongoDB filter from query string.
 */
export function buildFilter(query) {
  const filter = {};

  applyTextSearchFilter(filter, query);
  applyLocationFilter(filter, query);
  applyHydrogenTypeFilter(filter, query);
  applyPriceFilter(filter, query);
  applyDeliveryFilter(filter, query);
  applyFeaturedFilter(filter, query);

  return filter;
}
