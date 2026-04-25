import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { checkSubscriptionExpiry } from "../middleware/checkSubscription.js";
import {
  getPlans,
  createOrder,
  verifyPayment,
  getMySubscription,
} from "../controllers/billingController.js";

const router = Router();

// Public: list available plans
router.get("/plans", getPlans);

// Protected
router.use(authenticate);

// Check & auto-downgrade expired subscriptions on billing routes
router.use(checkSubscriptionExpiry);

router.get("/me", getMySubscription);

// Must be seller to upgrade plans
router.post("/create-order", authorizeRoles("seller"), createOrder);
router.post("/verify", authorizeRoles("seller"), verifyPayment);

export default router;