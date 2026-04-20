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
import { upload } from "../middleware/upload.js";

const router = Router();

// Public: browse with filters
router.get("/", getListings);

// Single listing (optional JWT adds `saved` flag) — register before /:id mutations
router.get("/:id", optionalAuthenticate, getListingById);

// Protected: sellers only for mutations
router.post("/", authenticate, requireSeller, upload.array("images", 5), createListing);
router.put("/:id", authenticate, requireSeller, upload.array("images", 5), updateListing);
router.delete("/:id", authenticate, requireSeller, deleteListing);

export default router;
