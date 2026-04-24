import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";
import SavedListing from "../models/SavedListing.js";
import Contact from "../models/Contact.js";
import { sendApprovalEmail, sendListingStatusEmail } from "../services/emailService.js";

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalBuyers, totalSellers, totalListings, pendingListings,
      featuredListings, totalInquiries, unverifiedSellers, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller" }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "pending" }),
      Listing.countDocuments({ isFeatured: true }),
      Inquiry.countDocuments(),
      User.countDocuments({ role: "seller", isVerified: false }),
      User.countDocuments({ role: "seller", isApproved: false }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: todayStart } });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const newListingsThisWeek = await Listing.countDocuments({ createdAt: { $gte: weekStart } });

    // Hydrogen type distribution (live from DB)
    const hydrogenDist = await Listing.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$hydrogenType", count: { $sum: 1 } } },
    ]);
    const approvedTotal = hydrogenDist.reduce((s, r) => s + r.count, 0) || 1;
    const hydrogenBreakdown = hydrogenDist.map(r => ({
      name: `${r._id} Hydrogen`,
      count: r.count,
      share: `${Math.round((r.count / approvedTotal) * 100)}%`,
    }));

    // Weekly user signups for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const found = dailySignups.find(s => s._id === ds);
      chartData.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), leads: found ? found.count : 0 });
    }

    // Paid plan count
    const paidUsers = await User.countDocuments({ plan: { $in: ["pro_supplier", "enterprise"] } });

    res.json({
      totalUsers, totalBuyers, totalSellers,
      totalListings, pendingListings, featuredListings,
      totalInquiries, newUsersToday, newListingsThisWeek,
      unverifiedSellers, pendingApprovals,
      hydrogenBreakdown,
      chartData,
      paidUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin stats", error: error.message });
  }
};

/**
 * GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, q, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role && role !== "All") query.role = role.toLowerCase();
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

/**
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const ALLOWED_ROLES = ["buyer", "seller", "admin"];
    const { role } = req.body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: `role must be one of: ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role" });
  }
};

/**
 * PUT /api/admin/users/:id/suspend
 */
export const suspendUser = async (req, res) => {
  try {
    const { suspend } = req.body;
    if (typeof suspend !== "boolean") {
      return res.status(400).json({ message: "suspend must be a boolean" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isSuspended = suspend;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error toggling user suspension" });
  }
};

/**
 * DELETE /api/admin/users/:id
 *
 * Cascade deletes all data owned by or associated with the user:
 *   - Listings they created (seller)
 *   - Inquiries they sent (buyer) or received (seller)
 *   - SavedListings they bookmarked (buyer) or others bookmarked of their listings (seller)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userId = user._id;

    // Collect this seller's listing IDs so we can purge dependent docs
    const sellerListingIds = await Listing.find({ seller: userId })
      .select("_id")
      .lean()
      .then((docs) => docs.map((d) => d._id));

    // Run all dependent deletes in parallel
    await Promise.all([
      // User's own bookmarks (as buyer)
      SavedListing.deleteMany({ user: userId }),
      // Other users' bookmarks pointing at this seller's listings
      SavedListing.deleteMany({ listing: { $in: sellerListingIds } }),
      // Inquiries this user sent (as buyer)
      Inquiry.deleteMany({ buyerId: userId }),
      // Inquiries this user received (as seller)
      Inquiry.deleteMany({ sellerId: userId }),
      // All listings owned by this seller
      Listing.deleteMany({ seller: userId }),
    ]);

    await User.deleteOne({ _id: userId });
    res.json({ message: "User and all associated data deleted" });
  } catch (error) {
    console.error("[deleteUser] cascade error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

/**
 * GET /api/admin/listings
 */
export const getListings = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status.toLowerCase();
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { companyName: { $regex: q, $options: "i" } },
      ];
    }

    const listings = await Listing.find(query)
      .populate("seller", "name email isVerified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);
    res.json({ listings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};

/**
 * PUT /api/admin/listings/:id/approve
 */
export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true }).populate("seller", "email name");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller?.email) {
      sendListingStatusEmail(
        listing.seller.email,
        listing.seller.name,
        listing.title || listing.companyName,
        "approved"
      ).catch((err) => console.error("[ADMIN] Approval email failed:", err.message));
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error approving listing" });
  }
};

/**
 * PUT /api/admin/listings/:id/reject
 */
export const rejectListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true }).populate("seller", "email name");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller?.email) {
      sendListingStatusEmail(
        listing.seller.email,
        listing.seller.name,
        listing.title || listing.companyName,
        "rejected"
      ).catch((err) => console.error("[ADMIN] Rejection email failed:", err.message));
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting listing" });
  }
};

/**
 * PUT /api/admin/listings/:id/feature
 */
export const toggleFeatureListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    listing.isFeatured = !listing.isFeatured;
    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error toggling feature" });
  }
};

/**
 * DELETE /api/admin/listings/:id
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    // Cascade: remove any saved references and inquiries to this listing
    await Promise.all([
      Listing.deleteOne({ _id: listing._id }),
      SavedListing.deleteMany({ listing: listing._id }),
      Inquiry.deleteMany({ listingId: listing._id }),
    ]);
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting listing" });
  }
};

/**
 * GET /api/admin/inquiries
 */
export const getInquiries = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
      Inquiry.find()
        .populate("buyerId", "name email")
        .populate("sellerId", "name email")
        .populate("listingId", "companyName title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(),
    ]);
    res.json({ data: inquiries, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching inquiries" });
  }
};

/**
 * GET /api/admin/contacts
 */
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts" });
  }
};

/**
 * PUT /api/admin/users/:id/verify
 * Grants the "Verified Badge" AND approves the supplier to create listings.
 */
export const verifySupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "seller") {
      return res.status(400).json({ message: "Only sellers can be verified" });
    }

    const wasApproved = user.isApproved;
    user.isVerified = true;
    user.isApproved = true;
    await user.save();

    if (!wasApproved) {
      sendApprovalEmail(user.email, user.name).catch(err =>
        console.error("Approval email failed:", err.message)
      );
    }

    // Bug fix: never expose password hash — return only safe fields
    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, isVerified: user.isVerified, isApproved: user.isApproved,
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying supplier" });
  }
};

/**
 * PUT /api/admin/users/:id/approve
 * Approves a supplier to create listings (without full verification badge).
 */
export const approveSupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "seller") {
      return res.status(400).json({ message: "Only sellers can be approved" });
    }

    const wasApproved = user.isApproved;
    user.isApproved = true;
    await user.save();

    if (!wasApproved) {
      sendApprovalEmail(user.email, user.name).catch(err =>
        console.error("Approval email failed:", err.message)
      );
    }

    res.json({ 
      message: "Supplier approved", 
      user: {
        _id: user._id, name: user.name, email: user.email,
        role: user.role, isVerified: user.isVerified, isApproved: user.isApproved,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error approving supplier" });
  }
};

/**
 * PUT /api/admin/inquiries/:id/flag
 */
export const flagInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    // Bug fix: null check before accessing properties
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    inquiry.isFlagged = !inquiry.isFlagged;
    await inquiry.save();
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: "Error toggling flag" });
  }
};

/**
 * DELETE /api/admin/inquiries/:id
 */
export const deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting inquiry" });
  }
};

/**
 * PUT /api/admin/contacts/:id/respond
 */
export const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    // Bug fix: null check before accessing properties
    if (!contact) return res.status(404).json({ message: "Contact not found" });
    contact.isResponded = !contact.isResponded;
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Error updating contact status" });
  }
};
