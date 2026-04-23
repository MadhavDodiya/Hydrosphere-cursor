import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";

/**
 * GET /api/seller/stats
 * Enhanced to provide activity and chart data.
 */
export async function getSellerStats(req, res) {
  try {
    const userId = req.userId;

    const [totalListings, activeListings, totalLeads] = await Promise.all([
      Listing.countDocuments({ seller: userId }),
      Listing.countDocuments({ seller: userId, status: "approved" }),
      Inquiry.countDocuments({ sellerId: userId }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newLeadsToday = await Inquiry.countDocuments({
      sellerId: userId,
      createdAt: { $gte: todayStart },
    });

    const statusAgg = await Inquiry.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const leadStatusCounts = { new: 0, contacted: 0, closed: 0 };
    for (const row of statusAgg) {
      if (row?._id && leadStatusCounts[row._id] != null) {
        leadStatusCounts[row._id] = row.count;
      }
    }

    const conversionRate = totalLeads > 0 ? Math.round((leadStatusCounts.closed / totalLeads) * 1000) / 10 : 0;

    // 1. Activity Feed: 5 most recent inquiries
    const recentInquiries = await Inquiry.find({ sellerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('listingId', 'companyName')
      .lean();

    const activity = recentInquiries.map(iq => ({
      id: iq._id,
      type: 'inquiry',
      desc: `New inquiry from ${iq.name} for ${iq.listingId?.title || iq.listingId?.companyName || 'Listing'}`,
      time: iq.createdAt,
    }));

    // 2. Chart data: Leads over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await Inquiry.aggregate([
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(userId),
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

    res.json({
      totalListings,
      activeListings,
      totalLeads,
      newLeadsToday,
      leadStatusCounts,
      conversionRate,
      activity,
      chartData,
      revenueEstimated: 0,
    });
  } catch (error) {
    console.error("Seller Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}
