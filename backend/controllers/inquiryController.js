import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

/**
 * Helper to log context (Requested Task #6)
 */
function logContext(userId, action, data) {
  console.log(`[INQUIRY] USER: ${userId} | ACTION: ${action}`);
  if (data) console.log(`[INQUIRY] DATA:`, JSON.stringify(data, null, 2));
}

/**
 * POST /api/inquiries
 */
export async function createInquiry(req, res) {
  try {
    logContext(req.userId, "CREATE", req.body);
    
    if (req.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can send inquiries" });
    }

    const { listingId, name, email, phone, message } = req.body;
    if (!listingId || !mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Valid Listing ID is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const inquiry = await Inquiry.create({
      buyerId: req.userId,
      sellerId: listing.seller,
      listingId,
      name,
      email,
      phone,
      message,
    });

    // Notify seller (email logic preserved)
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
    return res.status(500).json({ message: "Failed to fetch leads" });
  }
}

/**
 * GET /api/inquiries/buyer
 */
export async function getBuyerInquiries(req, res) {
  try {
    logContext(req.userId, "FETCH_BUYER");
    
    const inquiries = await Inquiry.find({ buyerId: req.userId })
      .populate("sellerId", "name companyName email")
      .populate("listingId", "companyName hydrogenType price")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(inquiries);
  } catch (err) {
    console.error("[GET BUYER INQUIRIES Error]:", err);
    return res.status(500).json({ message: "Failed to fetch inquiries" });
  }
}

/**
 * POST /api/inquiries/:id/reply
 */
export async function replyToInquiry(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message required" });

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    let senderRole = null;
    if (inquiry.buyerId.toString() === req.userId) senderRole = "buyer";
    if (inquiry.sellerId.toString() === req.userId) senderRole = "seller";

    if (!senderRole) return res.status(403).json({ message: "Unauthorized" });

    inquiry.replies.push({
      senderRole,
      message: String(message).trim(),
    });

    await inquiry.save();
    return res.status(201).json(inquiry);
  } catch (err) {
    console.error("[REPLY Error]:", err);
    return res.status(500).json({ message: "Failed to send reply" });
  }
}
