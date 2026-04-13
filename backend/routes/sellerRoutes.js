import { Router } from "express";
import { authenticate, requireSeller } from "../middleware/auth.js";
import { getSellerStats } from "../controllers/sellerController.js";

const router = Router();

router.get("/stats", authenticate, requireSeller, getSellerStats);

export default router;
