import { Router } from "express";
import {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { authenticate, requireSeller } from "../middleware/auth.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public browsable routes
router.get("/", getListings);

// Specific routes MUST come before generic :id
router.get("/my-listings", authenticate, requireSeller, getMyListings);

// Single listing (with optional auth details)
router.get("/:id", optionalAuthenticate, getListingById);

// Protected routes (Mutations)
router.post("/", authenticate, requireSeller, upload.array("images", 5), createListing);
router.put("/:id", authenticate, requireSeller, upload.array("images", 5), updateListing);
router.delete("/:id", authenticate, requireSeller, deleteListing);

export default router;
