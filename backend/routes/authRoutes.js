import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/authController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth endpoints
  message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
