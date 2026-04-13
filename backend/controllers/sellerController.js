import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";

/**
 * GET /api/seller/stats
 */
export async function getSellerStats(req, res) {
  try {
    const userId = req.userId;

    const [totalListings, activeListings, totalLeads] = await Promise.all([
      Listing.countDocuments({ seller: userId }),
      Listing.countDocuments({ seller: userId, status: "approved" }),
      Inquiry.countDocuments({ sellerId: userId }),
    ]);

    // Simple today calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newLeadsToday = await Inquiry.countDocuments({
      sellerId: userId,
      createdAt: { $gte: today },
    });

    res.json({
      totalListings,
      activeListings,
      totalLeads,
      newLeadsToday,
      revenueEstimated: 0, // Placeholder
    });
  } catch (error) {
    console.error("Seller Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}
