import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";
import Contact from "../models/Contact.js";
import Subscription from "../models/Subscription.js";
import { sendApprovalEmail, sendListingStatusEmail } from "../services/emailService.js";

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
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
      paidUsers
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
      User.countDocuments({ plan: { $nin: ["none", "free"] } }),
    ]);

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

    res.json({
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
      chartData
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
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * PUT /api/admin/users/:id/approve
 */
export const approveSupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    user.isApproved = true;
    await user.save();

    sendApprovalEmail(user.email, user.name).catch(err => console.error("Email failed:", err));

    res.json({ message: "Supplier approved", user });
  } catch (error) {
    res.status(500).json({ message: "Error approving supplier" });
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
    res.json({ listings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
};

/**
 * PUT /api/admin/users/:id/verify
 */
export const verifySupplier = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    user.isApproved = true;
    user.isVerified = true;
    await user.save();

    res.json({ message: "Supplier verified", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying supplier" });
  }
};

/**
 * PUT /api/admin/listings/:id/approve
 */
export const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true }).populate("supplier", "email name");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.supplier?.email) {
      sendListingStatusEmail(listing.supplier.email, listing.supplier.name, listing.title, "approved")
        .catch(err => console.error("Email failed:", err));
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
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true }).populate("supplier", "email name");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.supplier?.email) {
      sendListingStatusEmail(listing.supplier.email, listing.supplier.name, listing.title, "rejected")
        .catch(err => console.error("Email failed:", err));
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting listing" });
  }
};
