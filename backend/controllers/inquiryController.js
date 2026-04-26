import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendInquiryEmail, sendReplyNotificationEmail } from "../services/emailService.js";
import { emitInquiryCreated, emitInquiryUpdated } from "../utils/realtime.js";
import { trackEvent, ANALYTICS_EVENTS } from "../services/analyticsService.js";
import { getEffectiveLimits } from "../utils/plans.js";

/**
 * POST /api/inquiries
 */
export async function createInquiry(req, res) {
  try {
    const { listingId, name, email, message } = req.body;
    if (!listingId || !mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ success: false, message: "Valid Listing ID is required" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    // Prevent self-inquiry
    if (String(listing.supplier) === String(req.userId)) {
      return res.status(400).json({ success: false, message: "You cannot inquire on your own listing" });
    }

    const supplier = await User.findById(listing.supplier).select("email subscriptionStatus plan");
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    // Only paid/trial suppliers can receive inquiries
    if (supplier.subscriptionStatus !== "active") {
      return res.status(403).json({ success: false, message: "This supplier is currently not accepting inquiries." });
    }

    // SaaS: Inquiry/Lead limit enforcement
    const { plan, leadsLimitPerMonth } = getEffectiveLimits({
      planId: supplier.plan,
    });

    if (leadsLimitPerMonth != null) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const leadCount = await Inquiry.countDocuments({
        supplierId: listing.supplier,
        createdAt: { $gte: startOfMonth }
      });

      if (leadCount >= leadsLimitPerMonth) {
        return res.status(402).json({
          success: false,
          message: `This supplier has reached their monthly lead limit for the ${plan.name} plan.`,
        });
      }
    }

    // Prevent duplicate inquiries
    const existing = await Inquiry.findOne({ listingId, buyerId: req.userId });
    if (existing) return res.status(400).json({ success: false, message: "You have already sent an inquiry for this listing." });

    const inquiry = await Inquiry.create({
      buyerId: req.userId,
      supplierId: listing.supplier,
      listingId,
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      message: String(message || "").trim(),
      status: "pending",
    });

    // Notify supplier
    sendInquiryEmail(supplier.email, name, listing.title, message)
      .catch(err => console.error("Failed to send inquiry email:", err));

    // Realtime notification
    try {
      const populated = await Inquiry.findById(inquiry._id)
        .populate("listingId")
        .populate("buyerId")
        .lean();
      emitInquiryCreated(populated);
    } catch (e) {
      console.error("Realtime notification failed:", e);
    }

    // Track Event
    trackEvent(req.userId, ANALYTICS_EVENTS.INQUIRY_SENT, { listingId, supplierId: listing.supplier });

    return res.status(201).json({ 
      success: true, 
      data: inquiry, 
      message: "Inquiry sent successfully" 
    });
  } catch (err) {
    console.error("[CREATE INQUIRY Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to send inquiry" });
  }
}

/**
 * GET /api/inquiries/supplier
 */
export async function getSupplierInquiries(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = { supplierId: req.userId };
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("listingId", "title hydrogenType price")
        .populate("buyerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: "Inquiries fetched successfully",
      data: {
        inquiries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
}

/**
 * GET /api/inquiries/buyer
 */
export async function getBuyerInquiries(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = { buyerId: req.userId };
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("supplierId", "name companyName email")
        .populate("listingId", "title hydrogenType price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      message: "Inquiries fetched successfully",
      data: {
        inquiries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch inquiries" });
  }
}

/**
 * PUT /api/inquiries/:id/status
 */
export async function updateInquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    if (String(inquiry.supplierId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (!["pending", "responded", "closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    inquiry.status = status;
    await inquiry.save();

    const populated = await Inquiry.findById(inquiry._id)
      .populate("listingId")
      .populate("buyerId")
      .populate("supplierId")
      .lean();

    emitInquiryUpdated(populated);

    return res.json({ 
      success: true, 
      data: inquiry, 
      message: "Inquiry status updated" 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update inquiry status" });
  }
}

/**
 * POST /api/inquiries/:id/reply
 */
export async function replyToInquiry(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    let senderRole = null;
    if (inquiry.buyerId.toString() === req.userId) senderRole = "buyer";
    if (inquiry.supplierId.toString() === req.userId) senderRole = "supplier";

    if (!senderRole) return res.status(403).json({ success: false, message: "Not authorized" });

    inquiry.replies.push({
      senderRole,
      message: String(message).trim(),
    });

    if (senderRole === "supplier") {
      inquiry.status = "responded";
    }

    await inquiry.save();

    // Notify other party
    const populated = await Inquiry.findById(inquiry._id)
      .populate("listingId")
      .populate("buyerId")
      .populate("supplierId")
      .lean();

    emitInquiryUpdated(populated);

    const recipient = senderRole === "supplier" ? populated.buyerId : populated.supplierId;
    const senderName = senderRole === "supplier" ? (populated.supplierId.name) : (populated.buyerId.name);

    if (recipient?.email) {
      sendReplyNotificationEmail(recipient.email, senderName, populated.listingId?.title, message)
        .catch(err => console.error("Failed to send reply notification email:", err));
    }

    return res.status(201).json({ 
      success: true, 
      data: inquiry, 
      message: "Reply sent successfully" 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to send reply" });
  }
}
