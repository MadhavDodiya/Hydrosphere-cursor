import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { getPlan } from "../utils/plans.js";
import { emitInquiryCreated, emitInquiryUpdated } from "../utils/realtime.js";

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

    const { listingId, name, email, phone, message } = req.body;
    if (!listingId || !isValidId(listingId)) {
      return res.status(400).json({ message: "Valid Listing ID is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Prevent self-inquiry
    if (String(listing.seller) === String(req.userId)) {
      return res.status(400).json({ message: "You cannot inquire on your own listing" });
    }

    // Task #8: Validate listing.seller before creating inquiry
    if (!listing.seller || !isValidId(listing.seller)) {
       return res.status(500).json({ message: "Listing is missing valid seller information" });
    }

    // SaaS: lead monetization (limit leads for free sellers per month)
    const seller = await User.findById(listing.seller).select("plan subscriptionStatus");
    const plan = getPlan(seller?.plan);
    if (plan.leadsLimitPerMonth != null) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const leadsThisMonth = await Inquiry.countDocuments({
        sellerId: listing.seller,
        createdAt: { $gte: startOfMonth },
      });

      if (leadsThisMonth >= plan.leadsLimitPerMonth) {
        return res.status(402).json({
          message: "Seller lead limit reached. Please try again later.",
        });
      }
    }

    // Task #9: Prevent duplicate inquiries (same buyer + listing)
    const existingInquiry = await Inquiry.findOne({ listingId: listing._id, buyerId: req.userId });
    if (existingInquiry) return res.status(400).json({ message: "Already inquired" });

    let inquiry;
    try {
      inquiry = await Inquiry.create({
        buyerId: req.userId,
        sellerId: listing.seller,
        listingId,
        name: String(name || "").trim(),
        email: String(email || "").trim().toLowerCase(),
        phone: String(phone || "").trim(),
        message: String(message || "").trim(),
      });
    } catch (e) {
      // DB-level safety for duplicates
      if (e?.code === 11000) {
        return res.status(400).json({ message: "Already inquired" });
      }
      throw e;
    }

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

    // Realtime notify seller dashboard
    try {
      const populated = await Inquiry.findById(inquiry._id)
        .populate("listingId")
        .populate("buyerId")
        .lean();
      emitInquiryCreated(populated);
    } catch (e) {
      console.error("Realtime emit failed:", e?.message || e);
    }

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

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = { sellerId: req.userId };
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("listingId")
        .populate("buyerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.json({
      data: inquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = { buyerId: req.userId };
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("sellerId", "name companyName email")
        .populate("listingId", "companyName hydrogenType price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.json({
      data: inquiries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    // Realtime notify both parties
    try {
      const populated = await Inquiry.findById(inquiry._id)
        .populate("listingId")
        .populate("buyerId")
        .populate("sellerId")
        .lean();
      emitInquiryUpdated(populated);
    } catch (e) {
      console.error("Realtime emit failed:", e?.message || e);
    }

    return res.status(201).json(inquiry);
  } catch (err) {
    console.error("[REPLY Error]:", err);
    return res.status(500).json({ message: "Failed to send reply. Please try again." });
  }
}

/**
 * PUT /api/inquiries/:id/status (seller only)
 * Body: { status: "new" | "contacted" | "closed" }
 */
export async function updateInquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.userId || !isValidId(req.userId)) {
      return res.status(401).json({ message: "Invalid user ID" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID format" });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    if (String(inquiry.sellerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    inquiry.status = status;
    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate("listingId")
      .populate("buyerId")
      .populate("sellerId")
      .lean();

    emitInquiryUpdated(populated);

    return res.json(inquiry);
  } catch (err) {
    console.error("[UPDATE INQUIRY STATUS Error]:", err);
    return res.status(500).json({ message: "Failed to update lead status" });
  }
}
