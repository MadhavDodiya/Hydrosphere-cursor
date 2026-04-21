import { Router } from "express";
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import {
  getPlans,
  createCheckoutSession,
  createPortalSession,
  getMySubscription,
  stripeWebhook,
} from "../controllers/billingController.js";

export const billingWebhookRouter = Router();
billingWebhookRouter.post(
  "/",
  // Stripe requires the raw body to validate the signature.
  express.raw({ type: "application/json" }),
  stripeWebhook
);

const router = Router();

router.get("/plans", getPlans);

router.get("/me", authenticate, getMySubscription);

router.post(
  "/checkout",
  authenticate,
  authorizeRoles("seller"),
  validate({
    body: z.object({ planId: z.enum(["pro_supplier", "enterprise"]) }),
  }),
  createCheckoutSession
);

router.post("/portal", authenticate, authorizeRoles("seller"), createPortalSession);

export default router;

