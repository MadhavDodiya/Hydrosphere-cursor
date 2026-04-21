import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import {
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  replyToInquiry,
  updateInquiryStatus,
} from "../controllers/inquiryController.js";
import {
  inquiryCreateSchema,
  inquiryReplySchema,
  inquiryStatusSchema,
  paginationQuerySchema,
} from "../utils/validationSchemas.js";

const router = Router();

// Extra spam protection for lead creation (in addition to global /api limiter)
const createInquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many inquiries. Please try again later." },
});

router.post(
  "/",
  authenticate,
  authorizeRoles("buyer"),
  validate({ body: inquiryCreateSchema }),
  createInquiryLimiter,
  createInquiry
);

// Seller leads (alias endpoints)
router.get("/received", authenticate, authorizeRoles("seller"), validate({ query: paginationQuerySchema }), getSellerInquiries);
router.get("/seller", authenticate, authorizeRoles("seller"), validate({ query: paginationQuerySchema }), getSellerInquiries);

router.get("/buyer", authenticate, authorizeRoles("buyer"), validate({ query: paginationQuerySchema }), getBuyerInquiries);
router.post("/:id/reply", authenticate, authorizeRoles("buyer", "seller"), validate({ body: inquiryReplySchema }), replyToInquiry);
router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("seller"),
  validate({ body: inquiryStatusSchema }),
  updateInquiryStatus
);

export default router;
