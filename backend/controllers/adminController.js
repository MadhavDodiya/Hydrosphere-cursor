import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";
import Contact from "../models/Contact.js";
import Subscription from "../models/Subscription.js";
import { sendApprovalEmail, sendListingStatusEmail } from "../services/emailService.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const cachedStats = getCache("admin_stats");
    if (cachedStats) {
      return res.json({
        success: true,
        message: "Admin stats fetched successfully (cached)",
        data: cachedStats,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [
      totalUsers,
      totalBuyers,
      totalSuppliers,
      totalListings,
      pendingListings,
      totalInquiries,
      pendingApprovals,
      unverifiedSuppliers,
      featuredListings,
      newUsersToday,
      newListingsThisWeek,
      paidUsersCount, // Rename to avoid conflict with paidUsers var name if any
      totalRevenueResult,
      activeUsersCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "supplier" }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "pending" }),
      Inquiry.countDocuments(),
      User.countDocuments({ role: "supplier", isApproved: false }),
      User.countDocuments({ role: "supplier", isVerified: false }),
      Listing.countDocuments({ isFeatured: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Listing.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ plan: { $nin: ["none", "free", "Starter"] } }),
      Subscription.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const conversionRate = totalSuppliers > 0 ? (paidUsersCount / totalSuppliers) * 100 : 0;
    const paidUsers = paidUsersCount; // For backward compatibility in response

    // Hydrogen Type Distribution
    const rawBreakdown = await Listing.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$hydrogenType", count: { $sum: 1 } } }
    ]);
    
    const totalApproved = rawBreakdown.reduce((sum, item) => sum + item.count, 0);
    const hydrogenBreakdown = rawBreakdown.map(item => ({
      name: item._id || "Other",
      count: item.count,
      share: totalApproved > 0 ? `${Math.round((item.count / totalApproved) * 100)}%` : "0%"
    }));

    // Signup Chart Data (Last 7 Days)
    const chartDataRaw = await User.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Ensure all 7 days are present
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = chartDataRaw.find(item => item._id === dateStr);
      chartData.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: match ? match.count : 0
      });
    }

    const data = {
      totalUsers,
      totalBuyers,
      totalSuppliers,
      totalListings,
      pendingListings,
      totalInquiries,
      pendingApprovals,
      unverifiedSuppliers,
      featuredListings,
      newUsersToday,
      newListingsThisWeek,
      paidUsers,
      hydrogenBreakdown,
      chartData,
      totalRevenue,
      activeUsersCount,
      conversionRate
    };

    setCache("admin_stats", data);

    res.json({
      success: true,
      message: "Admin stats fetched successfully",
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching admin stats", error: error.message });
  }
};

/**
 * GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, q, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role && role !== "all") query.role = role.toLowerCase();
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
    res.json({ 
      success: true, 
      message: "Users fetched successfully",
      data: { users, total, pages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

/**
 * PUT /api/admin/users/:id/approve
 */
export const approveSupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "supplier") {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    user.isApproved = !user.isApproved;
    await user.save();

    if (user.isApproved) {
      sendApprovalEmail(user.email, user.name).catch(err => console.error("Email failed:", err));
    }
    clearCache("admin_stats");

    res.json({ 
      success: true,
      message: user.isApproved ? "Supplier approved" : "Supplier approval revoked", 
      data: user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling supplier approval" });
  }
};

/**
 * GET /api/admin/listings
 */
export const getListings = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status.toLowerCase();
    if (q) {
      query.title = { $regex: q, $options: "i" };
    }

    const listings = await Listing.find(query)
      .populate("supplier", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);
    res.json({ 
      success: true, 
      message: "Listings fetched successfully",
      data: { listings, total, pages: Math.ceil(total / limit) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching listings" });
  }
};

/**
 * PUT /api/admin/users/:id/verify
 */
export const verifySupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "supplier") {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    user.isApproved = true;
    user.isVerified = true;
    await user.save();
    clearCache("admin_stats");

    res.json({ success: true, message: "Supplier verified", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying supplier" });
  }
};

/**
 * PUT /api/admin/listings/:id/approve
 */
export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true }).populate("supplier", "email name");
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.supplier?.email) {
      sendListingStatusEmail(listing.supplier.email, listing.supplier.name, listing.title, "approved")
        .catch(err => console.error("Email failed:", err));
    }
    clearCache("admin_stats");

    res.json({ success: true, message: "Listing approved", data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving listing" });
  }
};

/**
 * PUT /api/admin/listings/:id/reject
 */
export const rejectListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true }).populate("supplier", "email name");
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.supplier?.email) {
      sendListingStatusEmail(listing.supplier.email, listing.supplier.name, listing.title, "rejected")
        .catch(err => console.error("Email failed:", err));
    }
    clearCache("admin_stats");

    res.json({ success: true, message: "Listing rejected", data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting listing" });
  }
};

/**
 * GET /api/admin/inquiries
 */
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("buyerId", "name email")
      .populate("supplierId", "name email")
      .populate("listingId", "title companyName")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, message: "Inquiries fetched successfully", data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching inquiries" });
  }
};

/**
 * PUT /api/admin/inquiries/:id/flag
 */
export const flagInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
    inquiry.isFlagged = !inquiry.isFlagged;
    await inquiry.save();
    res.json({ success: true, message: "Inquiry flag toggled", data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling flag" });
  }
};

/**
 * DELETE /api/admin/inquiries/:id
 */
export const deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    clearCache("admin_stats");
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting inquiry" });
  }
};
