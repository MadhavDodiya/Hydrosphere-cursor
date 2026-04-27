import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";
import User from "../models/User.js";
import { getEffectiveLimits } from "../utils/plans.js";

export const getSupplierStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("plan listingLimit leadLimit trialExpiresAt").lean();
    
    const [totalListings, activeListings, totalLeads, newLeadsToday] = await Promise.all([
      Listing.countDocuments({ supplier: req.userId }),
      Listing.countDocuments({ supplier: req.userId, status: "approved" }),
      Inquiry.countDocuments({ supplierId: req.userId }),
      Inquiry.countDocuments({ 
        supplierId: req.userId, 
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
      }),
    ]);

    const { plan, listingsLimit, leadsLimitPerMonth } = getEffectiveLimits({
      planId: user.plan,
      listingLimitOverride: user.listingLimit,
      leadLimitOverride: user.leadLimit,
    });

    // ... rest of activity logic ...
    const recentInquiries = await Inquiry.find({ supplierId: req.userId }).lean()
      .populate("listingId", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activity = recentInquiries.map(iq => ({
      id: iq._id,
      type: "inquiry",
      title: "New Inquiry",
      description: `Inquiry for ${iq.listingId?.title || "listing"}`,
      time: iq.createdAt,
    }));

    res.json({
      success: true,
      message: "Supplier stats fetched successfully",
      data: {
        totalListings,
        activeListings,
        totalLeads,
        newLeadsToday,
        activity,
        limits: {
          planName: plan.name,
          listingsUsed: totalListings,
          listingsLimit: listingsLimit,
          leadsUsed: totalLeads, // Note: usually we'd filter leads by current month here
          leadsLimit: leadsLimitPerMonth,
          trialExpiresAt: user.trialExpiresAt,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching supplier stats" });
  }
};
