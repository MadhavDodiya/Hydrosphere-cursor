import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

/**
 * Helper to log context (Requested Task #6 & #13)
 */
function logContext(userId, action, data) {
  console.log(`[INQUIRY] USER: ${userId} | ACTION: ${action}`);
  if (data) console.log(`[INQUIRY] DATA:`, JSON.stringify(data, null, 2));
}

/**
 * Validates ObjectId.
 */
function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

/**
 * POST /api/inquiries
 */
export async function createInquiry(req, res) {
  try {
    if (!req.userId || !isValidId(req.userId)) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    logContext(req.userId, "CREATE", req.body);
    
    if (req.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can send inquiries" });
    }

    const { listingId, name, email, phone, message } = req.body;
    if (!listingId || !isValidId(listingId)) {
      return res.status(400).json({ message: "Valid Listing ID is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Task #8: Validate listing.seller before creating inquiry
    if (!listing.seller || !isValidId(listing.seller)) {
       return res.status(500).json({ message: "Listing is missing valid seller information" });
    }

    // Task #9: Prevent duplicate inquiries (same buyer + listing)
    const existingInquiry = await Inquiry.findOne({ buyerId: req.userId, listingId: listing._id });
    if (existingInquiry) {
       return res.status(409).json({ message: "You have already sent an inquiry for this listing. Please check your dashboard to continue the conversation." });
    }

    const inquiry = await Inquiry.create({
      buyerId: req.userId,
      sellerId: listing.seller,
      listingId,
      name,
      email,
      phone,
      message,
    });

    // Notify seller
    try {
      const seller = await User.findById(listing.seller);
      if (seller?.email) {
        await sendEmail({
          to: seller.email,
          subject: `New Lead: ${listing.companyName}`,
          html: `<p>You have a new inquiry for ${listing.companyName}. Log in to view details.</p>`
        });
      }
    } catch (e) { console.error("Notification fail:", e.message); }

    return res.status(201).json(inquiry);
  } catch (err) {
    console.error("[CREATE INQUIRY Error]:", err);
    return res.status(500).json({ message: "Failed to send inquiry" });
  }
}

/**
 * GET /api/inquiries/seller
 */
export async function getSellerInquiries(req, res) {
  try {
    if (!req.userId || !isValidId(req.userId)) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    logContext(req.userId, "FETCH_SELLER");
    
    if (req.role !== "seller") {
      return res.status(403).json({ message: "Seller role required" });
    }

    const inquiries = await Inquiry.find({ sellerId: req.userId })
      .populate("buyerId", "name email")
      .populate("listingId", "companyName hydrogenType price")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(inquiries);
  } catch (err) {
    console.error("[GET SELLER INQUIRIES Error]:", err);
    return res.status(500).json({ message: "Failed to fetch leads. Please try again." });
  }
}

/**
 * GET /api/inquiries/buyer
 */
export async function getBuyerInquiries(req, res) {
  try {
    if (!req.userId || !isValidId(req.userId)) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    logContext(req.userId, "FETCH_BUYER");
    
    const inquiries = await Inquiry.find({ buyerId: req.userId })
      .populate("sellerId", "name companyName email")
      .populate("listingId", "companyName hydrogenType price")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(inquiries);
  } catch (err) {
    console.error("[GET BUYER INQUIRIES Error]:", err);
    return res.status(500).json({ message: "Failed to fetch inquiries. Please try again." });
  }
}

/**
 * POST /api/inquiries/:id/reply
 */
export async function replyToInquiry(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!req.userId || !isValidId(req.userId)) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID format" });
    }

    // Task #12: Improve inquiry reply validation
    if (!message || String(message).trim() === "") {
      return res.status(400).json({ message: "Reply message cannot be empty" });
    }
    
    if (String(message).trim().length > 2000) {
      return res.status(400).json({ message: "Reply message exceeds 2000 characters limit" });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    let senderRole = null;
    if (inquiry.buyerId.toString() === req.userId) senderRole = "buyer";
    if (inquiry.sellerId.toString() === req.userId) senderRole = "seller";

    if (!senderRole) return res.status(403).json({ message: "You are not authorized to reply to this inquiry" });

    inquiry.replies.push({
      senderRole,
      message: String(message).trim(),
    });

    await inquiry.save();
    return res.status(201).json(inquiry);
  } catch (err) {
    console.error("[REPLY Error]:", err);
    return res.status(500).json({ message: "Failed to send reply. Please try again." });
  }
}
