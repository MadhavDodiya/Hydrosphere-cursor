import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import { getSupplierStats } from "../controllers/supplierController.js";

const router = Router();

// All routes protected by supplier role
router.use(authenticate, authorizeRoles("supplier"));

router.get("/stats", getSupplierStats);

export default router;
