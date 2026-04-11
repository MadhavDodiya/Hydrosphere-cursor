import { Router } from "express";
import {
  getSavedListings,
  saveListing,
  unsaveListing,
} from "../controllers/savedController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getSavedListings);
// Body: { listingId } — register before any "/:listingId" if we had GET by id (we don't)
router.post("/", authenticate, saveListing);
router.delete("/:listingId", authenticate, unsaveListing);

export default router;
