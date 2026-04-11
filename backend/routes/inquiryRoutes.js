import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
} from "../controllers/inquiryController.js";

const router = Router();

router.post("/", authenticate, createInquiry);
router.get("/seller", authenticate, getSellerInquiries);
router.get("/buyer", authenticate, getBuyerInquiries);

export default router;

