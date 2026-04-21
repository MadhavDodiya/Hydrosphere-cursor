import mongoose from "mongoose";
import User from "../models/User.js";
import Inquiry from "../models/Inquiry.js";
import SavedListing from "../models/SavedListing.js";
import Listing from "../models/Listing.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyName: user.companyName || "",
    phone: user.phone || "",
    isVerified: Boolean(user.isVerified),
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
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}

/**
 * GET /api/users/stats (Buyer stats)
 */
export async function getBuyerStats(req, res) {
  try {
    const userId = req.userId;
    const [totalInquiries, totalSaved, totalListings] = await Promise.all([
      Inquiry.countDocuments({ buyerId: userId }),
      SavedListing.countDocuments({ user: userId }),
      Listing.countDocuments({}), 
    ]);

    // 1. Activity Feed: Recent inquiries sent + recent saved
    const [recentInquiries, recentSaved] = await Promise.all([
      Inquiry.find({ buyerId: userId }).sort({ createdAt: -1 }).limit(3).populate('listingId', 'companyName').lean(),
      SavedListing.find({ user: userId }).sort({ createdAt: -1 }).limit(3).populate('listing', 'companyName').lean()
    ]);

    const activity = [
      ...recentInquiries.map(iq => ({
        id: iq._id,
        type: 'inquiry',
        desc: `You sent an inquiry for ${iq.listingId?.companyName || 'a listing'}`,
        time: iq.createdAt
      })),
      ...recentSaved.map(s => ({
        id: s._id,
        type: 'save',
        desc: `You saved ${s.listing?.companyName || 'a listing'} to your bookmarks`,
        time: s.createdAt
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // 2. Chart data: Inquiries sent over last 7 days
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

    return res.json({
      totalInquiries,
      totalSaved,
      marketListings: totalListings,
      activity,
      chartData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch buyer stats" });
  }
}

/**
 * PUT /api/users/me
 */
export async function updateMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { companyName, phone } = req.body || {};

    if (companyName != null) {
      if (user.role !== "seller") return res.status(403).json({ message: "Seller role required" });
      user.companyName = String(companyName).trim();
    }

    if (phone != null) {
      if (user.role !== "seller") return res.status(403).json({ message: "Seller role required" });
      user.phone = String(phone).trim();
    }

    await user.save();
    return res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}
