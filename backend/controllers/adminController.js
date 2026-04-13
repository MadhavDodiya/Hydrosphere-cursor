import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Inquiry from "../models/Inquiry.js";
import Contact from "../models/Contact.js";

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: "buyer" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalListings = await Listing.countDocuments();
    const pendingListings = await Listing.countDocuments({ status: "pending" });
    const featuredListings = await Listing.countDocuments({ isFeatured: true });
    const totalInquiries = await Inquiry.countDocuments();
    const unverifiedSellers = await User.countDocuments({ role: "seller", isVerified: false });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: todayStart } });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const newListingsThisWeek = await Listing.countDocuments({ createdAt: { $gte: weekStart } });

    res.json({
      totalUsers, totalBuyers, totalSellers,
      totalListings, pendingListings, featuredListings,
      totalInquiries, newUsersToday, newListingsThisWeek,
      unverifiedSellers
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
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
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
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: suspend }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error toggling user suspension" });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // Optionally delete their listings/inquiries too
    res.json({ message: "User deleted" });
  } catch (error) {
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
    if (q) query.companyName = { $regex: q, $options: "i" };

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
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
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
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
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
    await Listing.findByIdAndDelete(req.params.id);
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
    const inquiries = await Inquiry.find()
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .populate("listingId", "companyName")
      .sort({ createdAt: -1 });
    res.json(inquiries);
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
 */
export const verifySupplier = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error verifying supplier" });
  }
};

/**
 * PUT /api/admin/inquiries/:id/flag
 */
export const flagInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
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
    contact.isResponded = !contact.isResponded;
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Error updating contact status" });
  }
};
