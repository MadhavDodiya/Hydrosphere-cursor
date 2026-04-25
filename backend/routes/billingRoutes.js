import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import {
  getPlans,
  createCheckoutSession,
  getMySubscription,
} from "../controllers/billingController.js";

const router = Router();

// Public: list available plans
router.get("/plans", getPlans);

// Protected
router.use(authenticate);

router.get("/me", getMySubscription);

// Must be supplier to upgrade plans
router.post("/create-checkout-session", authorizeRoles("supplier"), createCheckoutSession);

export default router;