import { Router } from "express";
import { getSavedListings, saveListing, unsaveListing } from "../controllers/savedController.js";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { paginationQuerySchema } from "../utils/validationSchemas.js";

const router = Router();

// Saved listings are a buyer feature.
router.get("/", authenticate, authorizeRoles("buyer"), validate({ query: paginationQuerySchema }), getSavedListings);
router.post("/", authenticate, authorizeRoles("buyer"), saveListing);
router.delete("/:listingId", authenticate, authorizeRoles("buyer"), unsaveListing);

export default router;
