import express from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import * as adminCtrl from "../controllers/adminController.js";

const router = express.Router();

// All routes protected by admin role
router.use(authenticate, authorizeRoles("admin"));

router.get("/stats", adminCtrl.getStats);

// Users
router.get("/users", adminCtrl.getUsers);
router.put("/users/:id/approve", adminCtrl.approveSupplier);
router.put("/users/:id/verify", adminCtrl.verifySupplier);

// Listings
router.get("/listings", adminCtrl.getListings);
router.put("/listings/:id/approve", adminCtrl.approveListing);
router.put("/listings/:id/reject", adminCtrl.rejectListing);

// Inquiry Monitor (Task #11 Audit)
router.get("/inquiries", adminCtrl.getInquiries);
router.put("/inquiries/:id/flag", adminCtrl.flagInquiry);
router.delete("/inquiries/:id", adminCtrl.deleteInquiry);

export default router;
