import { Router } from "express";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { authenticate, requireSeller } from "../middleware/auth.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.js";

const router = Router();

// Public: browse with filters
router.get("/", getListings);

// Single listing (optional JWT adds `saved` flag) — register before /:id mutations
router.get("/:id", optionalAuthenticate, getListingById);

// Protected: sellers only for mutations
router.post("/", authenticate, requireSeller, createListing);
router.put("/:id", authenticate, requireSeller, updateListing);
router.delete("/:id", authenticate, requireSeller, deleteListing);

export default router;
