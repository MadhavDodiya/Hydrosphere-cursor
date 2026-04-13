import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import * as adminCtrl from "../controllers/adminController.js";

const router = express.Router();

// All routes are protected by authenticate + requireAdmin
router.use(authenticate, requireAdmin);

router.get("/stats", adminCtrl.getStats);

// Users
router.get("/users", adminCtrl.getUsers);
router.put("/users/:id/role", adminCtrl.updateUserRole);
router.put("/users/:id/suspend", adminCtrl.suspendUser);
router.put("/users/:id/verify", adminCtrl.verifySupplier);
router.delete("/users/:id", adminCtrl.deleteUser);

// Listings
router.get("/listings", adminCtrl.getListings);
router.put("/listings/:id/approve", adminCtrl.approveListing);
router.put("/listings/:id/reject", adminCtrl.rejectListing);
router.put("/listings/:id/feature", adminCtrl.toggleFeatureListing);
router.delete("/listings/:id", adminCtrl.deleteListing);

// Communication
router.get("/inquiries", adminCtrl.getInquiries);
router.put("/inquiries/:id/flag", adminCtrl.flagInquiry);
router.delete("/inquiries/:id", adminCtrl.deleteInquiry);
router.get("/contacts", adminCtrl.getContacts);
router.put("/contacts/:id/respond", adminCtrl.updateContactStatus);

export default router;
