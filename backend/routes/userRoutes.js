import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getMe, updateMe } from "../controllers/userController.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

export default router;

