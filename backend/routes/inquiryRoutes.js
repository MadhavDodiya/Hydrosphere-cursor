import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  replyToInquiry,
} from "../controllers/inquiryController.js";

const router = Router();

router.post("/", authenticate, createInquiry);
router.get("/seller", authenticate, getSellerInquiries);
router.get("/buyer", authenticate, getBuyerInquiries);
router.post("/:id/reply", authenticate, replyToInquiry);

export default router;

