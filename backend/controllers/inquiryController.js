import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

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

    // Send email notification to seller
    try {
      const seller = await User.findById(listing.seller);
      if (seller && seller.email) {
        await sendEmail({
          to: seller.email,
          subject: `New Inquiry Received: ${listing.companyName} (${listing.hydrogenType} Hydrogen)`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Inquiry Received!</h2>
              <p>You have received a new lead on HydroSphere for your listing.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #0f172a;">Listing Details</h3>
                <p style="margin: 5px 0;"><strong>Product:</strong> ${listing.companyName} - ${listing.hydrogenType} Hydrogen</p>
                <p style="margin: 5px 0;"><strong>Price:</strong> $${listing.price}/kg</p>
              </div>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #0f172a;">Buyer Contact details</h3>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${trimmedName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #2563eb;">${trimmedEmail}</a></p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${trimmedPhone}</p>
              </div>

              <h3 style="color: #0f172a;">Message:</h3>
              <blockquote style="background: #f1f5f9; padding: 15px; border-left: 5px solid #94a3b8; font-style: italic; border-radius: 4px;">
                ${trimmedMessage}
              </blockquote>
              
              <div style="margin-top: 40px; text-align: center;">
                <p style="color: #64748b; font-size: 0.9em;">
                  Please log in to your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="color: #2563eb; text-decoration: none; font-weight: bold;">HydroSphere Dashboard</a> to view your full history and reply.
                </p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("[Email Notification Error] Failed to send email to seller:", emailErr);
    }

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

/**
 * POST /api/inquiries/:id/reply
 * Adds a reply to the inquiry thread.
 */
export async function replyToInquiry(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID" });
    }

    if (!message || String(message).trim() === "") {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // Determine role (is the user the buyer or the seller of this specific inquiry?)
    let senderRole = null;
    if (inquiry.buyerId.toString() === userId) senderRole = "buyer";
    if (inquiry.sellerId.toString() === userId) senderRole = "seller";

    if (!senderRole) {
      return res.status(403).json({ message: "You are not authorized to reply to this inquiry" });
    }

    inquiry.replies.push({
      senderRole,
      message: String(message).trim(),
    });

    await inquiry.save();

    // Ideally, send email notification to the OTHER party here.
    return res.status(201).json(inquiry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to post reply" });
  }
}

