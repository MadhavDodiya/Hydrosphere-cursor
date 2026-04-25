import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import {
  createInquiry,
  getBuyerInquiries,
  getSupplierInquiries,
  replyToInquiry,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";

const router = Router();

const createInquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: { message: "Too many inquiries. Please try again later." },
});

router.post(
  "/",
  authenticate,
  authorizeRoles("buyer"),
  createInquiryLimiter,
  createInquiry
);

router.get("/supplier", authenticate, authorizeRoles("supplier"), getSupplierInquiries);
router.get("/buyer", authenticate, authorizeRoles("buyer"), getBuyerInquiries);

router.post("/:id/reply", authenticate, authorizeRoles("buyer", "supplier"), replyToInquiry);

router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("supplier"),
  updateInquiryStatus
);

export default router;
