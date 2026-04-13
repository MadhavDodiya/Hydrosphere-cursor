import { Router } from "express";
import { submitContact } from "../controllers/contactController.js";

const router = Router();

// Public route - anyone can send a contact message
router.post("/", submitContact);

export default router;
