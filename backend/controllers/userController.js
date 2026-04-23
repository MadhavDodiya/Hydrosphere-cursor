import mongoose from "mongoose";
import User from "../models/User.js";
import Inquiry from "../models/Inquiry.js";
import SavedListing from "../models/SavedListing.js";
import Listing from "../models/Listing.js";

/**
 * Common public user object mapping (Task #5)
 */
function publicUser(user) {
  return {
    _id: user._id, 
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName || "",
    phone: user.phone || "",
    isVerified: Boolean(user.isVerified),
    isApproved: Boolean(user.isApproved),
    emailVerified: Boolean(user.emailVerified),
    plan: user.plan || "free",
    subscriptionStatus: user.subscriptionStatus || "inactive",
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd || null,
  };
}

/**
 * GET /api/users/me
 */
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(publicUser(user));
  } catch (err) {
    console.error("[GET_ME Error]:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

/**
 * GET /api/users/stats (Buyer stats)
 */
export async function getBuyerStats(req, res) {
  try {
    const userId = req.userId;
    console.log("[BUYER STATS] User:", userId);

    const [totalInquiries, totalSaved, totalListings] = await Promise.all([
      Inquiry.countDocuments({ buyerId: userId }),
      SavedListing.countDocuments({ user: userId }),
      Listing.countDocuments({ status: "approved" }), 
    ]);

    // Fetch Activity feed
    const [recentInquiries, recentSaved] = await Promise.all([
      Inquiry.find({ buyerId: userId }).sort({ createdAt: -1 }).limit(3).populate('listingId').lean(),
      SavedListing.find({ user: userId }).sort({ createdAt: -1 }).limit(3).populate('listing').lean()
    ]);

    const activity = [
      ...recentInquiries.map(iq => ({
        id: iq._id,
        type: 'inquiry',
        desc: `You sent an inquiry for ${iq.listingId?.title || iq.listingId?.companyName || 'a listing'}`,
        time: iq.createdAt
      })),
      ...recentSaved.map(s => ({
        id: s._id,
        type: 'save',
        desc: `You saved ${s.listing?.title || s.listing?.companyName || 'a listing'}`,
        time: s.createdAt
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // Chart data aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await Inquiry.aggregate([
      {
        $match: {
          buyerId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const found = dailyStats.find(s => s._id === ds);
      chartData.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        leads: found ? found.count : 0
      });
    }

    const stats = { totalInquiries, totalSaved, marketListings: totalListings, activity, chartData };
    console.log("[BUYER STATS] Result:", stats);

    return res.json(stats);
  } catch (err) {
    console.error("[GET_BUYER_STATS Error]:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

/**
 * PUT /api/users/me
 */
export async function updateMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, companyName, phone } = req.body;
    if (name != null && name.trim().length >= 1) user.name = name.trim();
    if (companyName != null) user.companyName = companyName.trim();
    if (phone != null) user.phone = phone.trim();

    await user.save();
    return res.json(publicUser(user));
  } catch (err) {
    console.error("[UPDATE_ME Error]:", err);
    return res.status(500).json({ message: "Update failed" });
  }
}
