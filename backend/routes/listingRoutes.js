import { Router } from "express";
import {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { authenticate, requireSupplier } from "../middleware/auth.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { listingCreateSchema, listingUpdateSchema } from "../utils/validationSchemas.js";
import { requireApprovedSupplier } from "../middleware/requireApprovedSupplier.js";
import { requireSubscription } from "../middleware/requireSubscription.js";

const router = Router();

// Public browsable routes
router.get("/", optionalAuthenticate, getListings);
router.get("/:id", optionalAuthenticate, getListingById);

// Specific routes
router.get("/my-listings", authenticate, requireSupplier, getMyListings);

// Protected routes (Mutations)
router.post(
  "/",
  authenticate,
  requireSupplier,
  requireApprovedSupplier,
  requireSubscription,
  upload.array("images", 5),
  validate({ body: listingCreateSchema }),
  createListing
);

router.put(
  "/:id",
  authenticate,
  requireSupplier,
  requireApprovedSupplier,
  requireSubscription,
  upload.array("images", 5),
  validate({ body: listingUpdateSchema }),
  updateListing
);

router.delete("/:id", authenticate, requireSupplier, deleteListing);

export default router;
