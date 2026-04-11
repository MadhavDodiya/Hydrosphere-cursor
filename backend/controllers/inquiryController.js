import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";

function isBuyer(req) {
  return req.userRole === "buyer";
}

function isSeller(req) {
  return req.userRole === "seller";
}

function safeTrim(v) {
  return v == null ? "" : String(v).trim();
}

/**
 * POST /api/inquiries
 * Buyer creates an inquiry for a listing (sellerId derived from listing).
 */
export async function createInquiry(req, res) {
  try {
    if (!isBuyer(req)) {
      return res.status(403).json({ message: "Buyer role required" });
    }

    const { listingId, name, email, phone, message } = req.body || {};

    if (!listingId || !mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: "Valid listingId is required" });
    }

    const listing = await Listing.findById(listingId).select("seller companyName hydrogenType location price");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const trimmedName = safeTrim(name);
    const trimmedEmail = safeTrim(email).toLowerCase();
    const trimmedPhone = safeTrim(phone);
    const trimmedMessage = safeTrim(message);

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedMessage) {
      return res.status(400).json({ message: "name, email, phone, and message are required" });
    }

    const inquiry = await Inquiry.create({
      buyerId: req.userId,
      sellerId: listing.seller,
      listingId: listing._id,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      message: trimmedMessage,
    });

    return res.status(201).json(inquiry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create inquiry" });
  }
}

/**
 * GET /api/inquiries/seller
 * Seller fetches inquiries for their listings.
 */
export async function getSellerInquiries(req, res) {
  try {
    if (!isSeller(req)) {
      return res.status(403).json({ message: "Seller role required" });
    }

    const inquiries = await Inquiry.find({ sellerId: req.userId })
      .populate("buyerId", "name email")
      .populate("listingId", "companyName hydrogenType location price quantity")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(inquiries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch inquiries" });
  }
}

/**
 * GET /api/inquiries/buyer
 * Buyer fetches inquiries they have sent.
 */
export async function getBuyerInquiries(req, res) {
  try {
    if (!isBuyer(req)) {
      return res.status(403).json({ message: "Buyer role required" });
    }

    const inquiries = await Inquiry.find({ buyerId: req.userId })
      .populate("sellerId", "name email companyName isVerified")
      .populate("listingId", "companyName hydrogenType location price quantity")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(inquiries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch inquiries" });
  }
}

