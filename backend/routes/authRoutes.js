import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  emailOnlySchema,
  resetPasswordSchema,
} from "../utils/validationSchemas.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // limit each IP to 10 requests per windowMs for auth endpoints
  message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
});

router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, validate({ body: loginSchema }), login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", authLimiter, validate({ body: emailOnlySchema }), resendVerification);
router.post("/forgot-password", authLimiter, validate({ body: emailOnlySchema }), forgotPassword);
router.post("/reset-password", authLimiter, validate({ body: resetPasswordSchema }), resetPassword);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
